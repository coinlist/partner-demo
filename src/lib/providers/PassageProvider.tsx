'use client';

import type { ClientConfig } from '@passage-cl/react';
import { PassageProvider, pinoClientLogger } from '@passage-cl/react';
import type { SignInMethod } from '@passage-cl/react/universal';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { coinlistEnv } from '@/lib/coinlistEnv';
import { useEvmWallet, useWalletConnection } from '@/lib/evm-wallet';
import { SDK_LOG_OPTIONS } from '@/lib/sdk-log-options';
import { postLogout } from '@/lib/sign-out';

// Built once rather than per render: the options are a build-time constant, so
// a logger rebuilt on every render would be a new pino instance each time - and
// a new `config` identity, which is what the memo below exists to avoid.
// Undefined against the production API, where the SDK is given no logger.
const logger = SDK_LOG_OPTIONS ? pinoClientLogger(SDK_LOG_OPTIONS) : undefined;

export function DemoPassageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // The SDK memoizes its client on the config's identity, so a fresh config
  // literal each render would mint a new client and unmount everything below it
  // (including a mid-flow swap). The config is derived entirely from build-time
  // env, so memoize it once for the provider's lifetime.
  const config = useMemo<ClientConfig>(
    () => ({
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
        const data = (await res.json()) as {
          value: string;
          expiresAt: string;
          signInMethod: SignInMethod;
        };
        return { ...data, expiresAt: new Date(data.expiresAt) };
      },
      // The browser half of the SDK's logging seam; the server half is wired in
      // `passage-server.ts` off the same options. Spread rather than
      // `logger: undefined`: the SDK's guarantee is about an absent key, and a
      // build pointed at the production API must carry no logging seam at all.
      ...(logger ? { logger } : {}),
    }),
    []
  );

  const connection = useWalletConnection();
  const { disconnect } = useEvmWallet();
  const router = useRouter();

  return (
    <PassageProvider
      config={config}
      // Wallet sign-in goes through this app's server, as OAuth does: the
      // challenge needs the partner's own token, and the session lands in the
      // same httpOnly cookie.
      walletSignIn={{
        challenge: (params) =>
          postJson('/api/coinlist/wallet/challenge', params),
        complete: async (params) => {
          await postJson('/api/coinlist/wallet/complete', params);
        },
        signOut: async () => {
          // Disconnected, the visitor connects and signs in again on the
          // offer's network.
          void disconnect();
          await postLogout();
          // The server components read the cleared cookie only on a refresh
          // after the logout route has cleared it.
          router.refresh();
        },
        connection,
      }}
    >
      {children}
    </PassageProvider>
  );
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed`);
  return (await res.json()) as T;
}
