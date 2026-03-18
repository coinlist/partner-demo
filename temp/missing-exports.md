# Missing public exports from coinlist-react

## Summary

Several types and values used by the SDK’s public API (e.g. `ClientConfig`, `ServerConfig`, `completeOAuth` return type) are defined in the package but not exported from the public entrypoints. Integrators need these to type `getAccessToken` responses, handle `completeOAuth()` results, and satisfy config types without `as unknown as …` casts.

---

## 1. Types/values only available internally (oauth-session chunk)

These live in `dist/oauth-session-37w7jIxL.d.ts` and are re-exported there under minified aliases (`A`, `C`, `a`, `b`, `c`, etc.), which are not part of the documented public API.

| Name | Kind | Description |
|------|------|-------------|
| `OAuthAccessToken` | type | `{ value: string; expiresAt: Date }` — needed to type `getAccessToken` return and access-token API responses |
| `OAuthSession` | type + `OAuthSession.fromDto` | Session shape used by `SessionStore` and `completeOAuth` |
| `AuthorizationCode` | type + constructor | Branded string for auth code |
| `CodeVerifier` | type + constructor | Branded string for PKCE code_verifier |
| `ClientId` | type + constructor | Branded string for `clientId` in config |
| `RedirectUri` | type + constructor | Branded string for `redirectUri` in config |
| `ClientSecret` | type + constructor | Branded string for `clientSecret` in server config |
| `OAuthRefreshToken` | type + constructor | Branded string for refresh token in session |
| `Config` | interface | Base config (`clientId`, `redirectUri`, `baseUrl?`) — only reachable today via `ClientConfig` / `ServerConfig` |

**Suggested exports**

- **From `coinlist-react/server`:**  
  `OAuthAccessToken`, `OAuthSession`, `SessionStore` (already exported), and the branded types/constructors above so server-side code and route handlers can type request/response and config without casting.

- **From `coinlist-react` (main entry):**  
  At least `OAuthAccessToken` so `ClientConfig.getAccessToken`’s return type can be used by consumers (e.g. when mapping a custom API response to the shape the SDK expects).

---

## 2. Client-only types defined but not exported

Defined in `dist/client/core/index.d.ts` but not re-exported from `coinlist-react` or `coinlist-react/client/*`:

| Name | Kind | Description |
|------|------|-------------|
| `AuthState` | type | `'unknown' \| 'logged-in' \| 'logged-out'` — return type of `getAuthState()` and `init()` |
| `OauthClientErrorReason` | type | `'missing_state' \| 'invalid_state' \| 'missing_code' \| 'missing_code_verifier'` — discriminant for `completeOAuth()` error branch |
| `OauthClientResult` | type | Discriminated union `{ type: 'ok'; code; codeVerifier } \| { type: 'error'; reason: OauthClientErrorReason }` — return type of `completeOAuth()` |
| `User` | type + `User.fromDto` | User shape returned by `getUser()` |
| `UserId` / `UserEmail` | types (+ constructors if present) | Used by `User` |

**Suggested exports**

- **From `coinlist-react`:**  
  `AuthState`, `OauthClientResult`, `OauthClientErrorReason`, and `User` (and related `UserId`/`UserEmail` if desired) so that:
  - Callbacks can type `completeOAuth()` results and switch on `reason`.
  - Code that uses `getUser()` or `getAuthState()` can type variables and function returns properly.

---

## 3. Impact on integrators

- **Config typing:** `ClientConfig` and `ServerConfig` use branded types for `clientId`, `redirectUri`, and (server) `clientSecret`. Without exported constructors or types, we have to cast env vars with `as unknown as ServerConfig['clientId']` (or similar), which is brittle and disables type safety.
- **Access token API:** A route that returns an access token (e.g. `GET /api/coinlist/access-token`) should return a shape compatible with `OAuthAccessToken`. Without an exported `OAuthAccessToken` type, we can’t reference it in our route’s return type.
- **Callback handling:** Typing the result of `coinlist.completeOAuth()` and switching on `res.reason` is much cleaner if `OauthClientResult` and `OauthClientErrorReason` are exported.

---

## 4. Suggested export checklist (for SDK maintainers)

- [ ] Export from **`coinlist-react/server`**: `OAuthAccessToken`, `OAuthSession`, and branded types/constructors: `ClientId`, `RedirectUri`, `ClientSecret`, `AuthorizationCode`, `CodeVerifier`, `OAuthRefreshToken` (and `Config` if you want to expose the base shape).
- [ ] Export from **`coinlist-react`**: `OAuthAccessToken`, `AuthState`, `OauthClientResult`, `OauthClientErrorReason`, `User` (and optionally `UserId`, `UserEmail`).

Once these are exported, Next.js (and other) integrators can type their providers, API routes, and callback pages without `any` or `unknown` casts.
