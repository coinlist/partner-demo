import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { OAuthSession } from "@coinlist-co/react/shared";
import { OAuthRefreshToken } from "@coinlist-co/react/shared";
import type { SessionStore } from "@coinlist-co/react/server";

const COINLIST_SESSION_COOKIE = "coinlist_session";

export async function getSessionOrNull(): Promise<OAuthSession | null> {
  try {
    const raw = (await cookies()).get(COINLIST_SESSION_COOKIE)?.value;
    return deserializeSession(raw);
  } catch {
    return null;
  }
}

export function validAccessToken(session: OAuthSession): boolean {
  return session.accessToken.expiresAt > new Date();
}

// Use in Route Handlers: buffers setSession() and applies it to the response
// via response.cookies.set(), which reliably attaches Set-Cookie headers.
// cookies().set() from next/headers does NOT reliably attach Set-Cookie to
// NextResponse objects returned from Route Handlers.
export function createRouteHandlerCookiesStore(): {
  store: SessionStore;
  applyCookies: (response: NextResponse) => NextResponse;
} {
  let pendingSession: OAuthSession | null | undefined = undefined;

  const store: SessionStore = {
    async getSession(): Promise<OAuthSession | null> {
      const raw = (await cookies()).get(COINLIST_SESSION_COOKIE)?.value;
      return deserializeSession(raw);
    },
    async setSession(session: OAuthSession | null): Promise<void> {
      pendingSession = session;
    },
  };

  function applyCookies(response: NextResponse): NextResponse {
    if (pendingSession === undefined) return response;
    if (pendingSession === null) {
      response.cookies.delete(COINLIST_SESSION_COOKIE);
    } else {
      response.cookies.set(
        COINLIST_SESSION_COOKIE,
        serializeSession(pendingSession),
        cookieOptions(),
      );
    }
    return response;
  }

  return { store, applyCookies };
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  };
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

/**
 * Session store for use in Next.js Server Components (e.g. app/page.tsx).
 *
 * Next.js does not allow setting cookies from Server Components — only from
 * Route Handlers and Server Actions. This store reads the session normally so
 * the SDK can use the current access token, but silently discards any writes.
 *
 * IMPORTANT: Because writes are discarded, you must NEVER call an SDK method
 * that may trigger a token refresh when using this store. A refresh consumes
 * the refresh token via a network call, but the new session cannot be persisted,
 * leaving the browser with an invalidated refresh token and causing silent logout.
 *
 * Safe pattern for Server Components:
 *
 *   const session = await getSessionOrNull();
 *   if (!session || !validAccessToken(session)) {
 *     // Token absent or expired — let the client handle renewal via the
 *     // GET /api/coinlist/oauth/access-token Route Handler, which CAN persist
 *     // the refreshed session using createRouteHandlerCookiesStore().
 *     return <HomeContainer offers={undefined} />;
 *   }
 *   // Token is valid — safe to call SDK methods; no refresh will fire.
 *   const offers = await coinListServer(noOpSessionStore()).fetchOffers()...
 */
export function noOpSessionStore(): SessionStore {
  return {
    async getSession(): Promise<OAuthSession | null> {
      const raw = (await cookies()).get(COINLIST_SESSION_COOKIE)?.value;
      return deserializeSession(raw);
    },
    async setSession(): Promise<void> {
      // no-op: intentionally discards writes (see JSDoc above).
    },
  };
}
