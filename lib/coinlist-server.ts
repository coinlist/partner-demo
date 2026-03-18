import "server-only";

import { cookies } from "next/headers";
import type { OAuthSession, ServerConfig } from "coinlist-react/server";
import { createCoinListServer } from "coinlist-react/server";

const COOKIE_NAME = "coinlist_session";

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };
}

type StoredSession = {
  accessToken: { value: string; expiresAt: string };
  refreshToken?: string;
};

type OAuthRefreshToken = NonNullable<OAuthSession["refreshToken"]>;

const sessionStore = {
  async getSession(): Promise<OAuthSession | null> {
    const raw = (await cookies()).get(COOKIE_NAME)?.value;
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
        ? { refreshToken: maybe.refreshToken as unknown as OAuthRefreshToken }
        : {}),
    };
  },

  async setSession(session: OAuthSession | null): Promise<void> {
    const cookieStore = await cookies();
    if (session == null) {
      cookieStore.delete(COOKIE_NAME);
      return;
    }

    const stored: StoredSession = {
      accessToken: {
        value: session.accessToken.value,
        expiresAt: session.accessToken.expiresAt.toISOString(),
      },
      ...(session.refreshToken ? { refreshToken: session.refreshToken as unknown as string } : {}),
    };

    cookieStore.set(COOKIE_NAME, JSON.stringify(stored), cookieOptions());
  },
};

export const coinlistServer = createCoinListServer({
  clientId: process.env.COINLIST_CLIENT_ID! as unknown as ServerConfig["clientId"],
  clientSecret: process.env.COINLIST_CLIENT_SECRET! as unknown as ServerConfig["clientSecret"],
  redirectUri: process.env.COINLIST_REDIRECT_URI! as unknown as ServerConfig["redirectUri"],
  sessionStore,
});

