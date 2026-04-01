"use client";

import { requiredEnv } from "@/lib/env";
import { ClientId, CoinListProvider, RedirectUri } from "@coinlist-co/react";
import type { ClientConfig } from "@coinlist-co/react";

export function Providers({ children }: { children: React.ReactNode }) {
  const config: ClientConfig = {
    clientId: ClientId(
      requiredEnv(
        "NEXT_PUBLIC_COINLIST_CLIENT_ID",
        process.env.NEXT_PUBLIC_COINLIST_CLIENT_ID,
      ),
    ),
    redirectUri: RedirectUri(
      requiredEnv(
        "NEXT_PUBLIC_COINLIST_REDIRECT_URI",
        process.env.NEXT_PUBLIC_COINLIST_REDIRECT_URI,
      ),
    ),
    baseUrl: "/api/coinlist-proxy",
    getAccessToken: async () => {
      const res = await fetch("/api/coinlist/oauth/access-token", {
        credentials: "include",
      });
      if (res.status === 204) return null;
      if (!res.ok) {
        throw new Error("GET /api/coinlist/oauth/access-token failed");
      }
      const data = (await res.json()) as { value: string; expiresAt: string };
      return {
        value: data.value,
        expiresAt: new Date(data.expiresAt),
      };
    },
  };

  return <CoinListProvider config={config}>{children}</CoinListProvider>;
}
