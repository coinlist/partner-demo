'use client';

import type { ClientConfig } from '@coinlist-co/react';
import { CoinListProvider } from '@coinlist-co/react';
import { coinlistEnv } from '@/lib/coinlistEnv';

export function DemoCoinListProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const config: ClientConfig = {
    clientId: coinlistEnv.clientId,
    redirectUri: coinlistEnv.redirectUri,
    // API host for the client's own data calls (offers, offer details,
    // requirements); web host for OAuth authorize + handleRequirement redirects.
    baseUrl: coinlistEnv.apiBaseUrl,
    coinlistBaseUrl: coinlistEnv.webBaseUrl,
    getAccessToken: async () => {
      const res = await fetch('/api/coinlist/oauth/access-token', {
        credentials: 'include',
      });
      if (res.status === 204) return null;
      if (!res.ok) {
        throw new Error('GET /api/coinlist/oauth/access-token failed');
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
