import "server-only";

import { cookies } from "next/headers";
import type { OAuthSession } from "coinlist-react/server";
import { OAuthRefreshToken } from "coinlist-react/server";

const COINLIST_SESSION_COOKIE = "coinlist_session";

type StoredSession = {
  accessToken: { value: string; expiresAt: string };
  refreshToken?: string;
};

export const sessionCookiesStore = {
  async getSession(): Promise<OAuthSession | null> {
    const raw = (await cookies()).get(COINLIST_SESSION_COOKIE)?.value;
    if (!raw) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }

    if (typeof parsed !== "object" || parsed == null) return null;
    const maybe = parsed as Partial<StoredSession>;
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
  },

  async setSession(session: OAuthSession | null): Promise<void> {
    const cookieStore = await cookies();
    if (session == null) {
      cookieStore.delete(COINLIST_SESSION_COOKIE);
      return;
    }

    const stored: StoredSession = {
      accessToken: {
        value: session.accessToken.value,
        expiresAt: session.accessToken.expiresAt.toISOString(),
      },
      ...(session.refreshToken
        ? { refreshToken: session.refreshToken as unknown as string }
        : {}),
    };

    cookieStore.set(
      COINLIST_SESSION_COOKIE,
      JSON.stringify(stored),
      cookieOptions(),
    );
  },
};

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };
}
