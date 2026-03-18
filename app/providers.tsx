"use client";

import { CoinListProvider } from "coinlist-react";
import type { ClientConfig } from "coinlist-react";

export function Providers({ children }: { children: React.ReactNode }) {
  const config: ClientConfig = {
    clientId: process.env.NEXT_PUBLIC_COINLIST_CLIENT_ID! as unknown as ClientConfig["clientId"],
    redirectUri:
      process.env.NEXT_PUBLIC_COINLIST_REDIRECT_URI! as unknown as ClientConfig["redirectUri"],
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

