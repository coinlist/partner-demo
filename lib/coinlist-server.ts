import "server-only";

import { cookies } from "next/headers";
import type { OAuthSession } from "coinlist-react/server";
import {
  ClientId,
  ClientSecret,
  createCoinListServer,
  RedirectUri,
} from "coinlist-react/server";

const COOKIE_NAME = "coinlist_session";

function requiredEnv(name: string, value: string | undefined): string {
  if (typeof value === "string" && value.length > 0) return value;
  throw new Error(`Missing required env var: ${name}`);
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
      ...(session.refreshToken
        ? { refreshToken: session.refreshToken as unknown as string }
        : {}),
    };

    cookieStore.set(COOKIE_NAME, JSON.stringify(stored), cookieOptions());
  },
};

let cached: ReturnType<typeof createCoinListServer> | null = null;

export function getCoinListServer() {
  if (cached) return cached;

  cached = createCoinListServer({
    clientId: ClientId(
      requiredEnv(
        "COINLIST_CLIENT_ID",
        process.env.NEXT_PUBLIC_COINLIST_CLIENT_ID,
      ),
    ),
    clientSecret: ClientSecret(
      requiredEnv("COINLIST_CLIENT_SECRET", process.env.COINLIST_CLIENT_SECRET),
    ),
    redirectUri: RedirectUri(
      requiredEnv(
        "NEXT_PUBLIC_COINLIST_REDIRECT_URI",
        process.env.NEXT_PUBLIC_COINLIST_REDIRECT_URI,
      ),
    ),
    sessionStore,
  });

  return cached;
}
