"use client";

import { ClientId, CoinListProvider, RedirectUri } from "coinlist-react";
import type { ClientConfig } from "coinlist-react";

function requiredPublicEnv(name: string, value: string | undefined): string {
  if (typeof value === "string" && value.length > 0) return value;
  throw new Error(`Missing required public env var: ${name}`);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const config: ClientConfig = {
    clientId: ClientId(requiredPublicEnv(
      "NEXT_PUBLIC_COINLIST_CLIENT_ID",
      process.env.NEXT_PUBLIC_COINLIST_CLIENT_ID,
    )),
    redirectUri:
      RedirectUri(requiredPublicEnv(
        "NEXT_PUBLIC_COINLIST_REDIRECT_URI",
        process.env.NEXT_PUBLIC_COINLIST_REDIRECT_URI,
      )),
    getAccessToken: async () => {
      const res = await fetch("/api/coinlist/access-token", {
        credentials: "include",
      });
      if (res.status === 401 || res.status === 204) return null;
      if (!res.ok) throw new Error("access-token failed");
      const data = (await res.json()) as { value: string; expiresAt: string };
      return {
        value: data.value,
        expiresAt: new Date(data.expiresAt),
      };
    },
  };

  return (
    <CoinListProvider
      config={config}
    >
      {children}
    </CoinListProvider>
  );
}

