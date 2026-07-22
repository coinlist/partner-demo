'use client';

import { Blockchain } from '@coinlist-co/react/shared';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { APPKIT_NETWORK, DEMO_CHAIN } from '@/lib/chain';
import { requiredEnv } from '@/lib/env';

// The funding chain for the invest/participation flow. Env-driven via
// `DEMO_CHAIN` (see `@/lib/chain`) so it tracks the same chain wallet-connect
// and the ownership challenge use, instead of drifting to a hardcoded mainnet.
export const ETHEREUM_CHAIN = Blockchain(DEMO_CHAIN);

const projectId = requiredEnv(
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
);

const wagmiAdapter = new WagmiAdapter({
  networks: [APPKIT_NETWORK],
  projectId,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [APPKIT_NETWORK],
  projectId,
  // A wallet reconnecting on some other chain must not block browsing. Without
  // this, AppKit auto-opens its "Switch Network" modal on page load and makes
  // the close button a no-op, so a mainnet-connected wallet can't even read the
  // offer page. Both wallet flows cope without the gate: the invest flow pins
  // balance reads to DEMO_CHAIN_ID and prompts the switch right before the tx,
  // and the ownership signature (`evm-wallet.ts`) is a `personal_sign`, which
  // is chain-independent.
  allowUnsupportedChain: true,
  metadata: {
    name: 'CoinList Partner Demo',
    description: 'Demo of the CoinList Partner SDK.',
    url: 'https://partner.coinlist.dev',
    icons: [],
  },
});

const queryClient = new QueryClient();

export function WalletConnectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
