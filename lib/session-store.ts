import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { OAuthSession } from "@coinlist-co/react/shared";
import { OAuthRefreshToken } from "@coinlist-co/react/shared";
import type { SessionStore } from "@coinlist-co/react/server";

const COINLIST_SESSION_COOKIE = "coinlist_session";

/**
 * Copy cookies set on `source` onto `target` so the handler can return `target`
 * with the same Set-Cookie headers (e.g. after refresh in accessToken()).
 */
export function copyCookiesFromTo(source: NextResponse, target: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    const { name, value, ...options } = cookie;
    target.cookies.set(name, value, options);
  }
}

/**
 * Session persistence for the CoinList server SDK.
 * This is a responsibility of the CoinList SDK user.
 *
 * In Route Handlers, always pass the `NextResponse` you will return from the
 * handler. `cookies().set()` from `next/headers` does not reliably attach
 * Set-Cookie to the route response; `response.cookies.set()` does.
 */
export function createSessionCookiesStore(
  outgoingResponse: NextResponse,
): SessionStore {
  return {
    async getSession(): Promise<OAuthSession | null> {
      const raw = (await cookies()).get(COINLIST_SESSION_COOKIE)?.value;
      return deserializeSession(raw);
    },

    async setSession(session: OAuthSession | null): Promise<void> {
      if (session == null) {
        outgoingResponse.cookies.delete(COINLIST_SESSION_COOKIE);
        return;
      }

      const value = serializeSession(session);
      outgoingResponse.cookies.set(
        COINLIST_SESSION_COOKIE,
        value,
        cookieOptions(),
      );
    },
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

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };
}

export function createNoOpCookiesSink(): NextResponse {
  return NextResponse.json({});
}
