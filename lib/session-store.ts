import "server-only";

import type { NextRequest, NextResponse } from "next/server";
import type { OAuthSession } from "@coinlist-co/react/shared";
import { OAuthRefreshToken } from "@coinlist-co/react/shared";
import type { SessionStore } from "@coinlist-co/react/server";

const COINLIST_SESSION_COOKIE = "coinlist_session";

export function cookiesSessionStore(request: NextRequest): {
  store: SessionStore;
  applyCookies: (response: NextResponse) => NextResponse;
} {
  let pendingSession: OAuthSession | null | undefined = undefined;

  const store: SessionStore = {
    async getSession(): Promise<OAuthSession | null> {
      const raw = request.cookies.get(COINLIST_SESSION_COOKIE)?.value;
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

export function readOnlySessionStore(): SessionStore {
  return {
    async getSession(): Promise<OAuthSession | null> {
      const { cookies } = await import("next/headers");
      const raw = (await cookies()).get(COINLIST_SESSION_COOKIE)?.value;
      return deserializeSession(raw);
    },
  };
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
