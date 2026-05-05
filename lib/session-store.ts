import "server-only";

import { cookies } from "next/headers";
import type { OAuthSession } from "@coinlist-co/react/shared";
import { OAuthRefreshToken } from "@coinlist-co/react/shared";
import type { SessionStore } from "@coinlist-co/react/server";

const COINLIST_SESSION_COOKIE = "coinlist_session";

/**
 * Session persistence for the CoinList server SDK backed by `cookies()` from
 * `next/headers`. This is the recommended approach for Next.js App Router:
 *
 * - In **Route Handlers** `(await cookies()).set()` writes a `Set-Cookie`
 *   header onto the outgoing response automatically – no need to pass a
 *   `NextResponse` around.
 * - In **Server Actions** cookies are equally writable.
 *
 * Do NOT use this from a plain Server Component: Next.js only allows cookie
 * mutation inside Route Handlers and Server Actions. Use `getServerSession()`
 * to read the session without triggering any refresh side-effects.
 */
export function createNextHeadersCookiesStore(): SessionStore {
  return {
    async getSession(): Promise<OAuthSession | null> {
      const raw = (await cookies()).get(COINLIST_SESSION_COOKIE)?.value;
      return deserializeSession(raw);
    },

    async setSession(session: OAuthSession | null): Promise<void> {
      const cookieStore = await cookies();
      if (session == null) {
        cookieStore.delete(COINLIST_SESSION_COOKIE);
        return;
      }
      cookieStore.set(
        COINLIST_SESSION_COOKIE,
        serializeSession(session),
        cookieOptions(),
      );
    },
  };
}

/**
 * Read the current session directly from the incoming request cookie without
 * going through the SDK (i.e. without triggering a token refresh).
 *
 * Use this in Server Components to gate which view to render. Actual token
 * refresh is handled by the Route Handler at `/api/coinlist/oauth/access-token`
 * which can safely write cookies back to the response.
 */
export async function getServerSession(): Promise<OAuthSession | null> {
  const raw = (await cookies()).get(COINLIST_SESSION_COOKIE)?.value;
  return deserializeSession(raw);
}

function deserializeSession(raw?: string): OAuthSession | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed == null) return null;
  const maybe = parsed as {
    accessToken?: { value?: unknown; expiresAt?: unknown };
    refreshToken?: unknown;
  };

  if (
    typeof maybe.accessToken?.value !== "string" ||
    typeof maybe.accessToken?.expiresAt !== "string"
  ) {
    return null;
  }

  const expiresAt = new Date(maybe.accessToken.expiresAt);
  if (Number.isNaN(expiresAt.getTime())) return null;

  return {
    accessToken: { value: maybe.accessToken.value, expiresAt },
    ...(typeof maybe.refreshToken === "string" && maybe.refreshToken !== ""
      ? { refreshToken: OAuthRefreshToken(maybe.refreshToken) }
      : {}),
  };
}

function serializeSession(session: OAuthSession): string {
  return JSON.stringify({
    accessToken: {
      value: session.accessToken.value,
      expiresAt: session.accessToken.expiresAt.toISOString(),
    },
    ...(session.refreshToken
      ? { refreshToken: String(session.refreshToken) }
      : {}),
  });
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };
}

