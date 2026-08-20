'use client';

import { Blockchain } from '@coinlist-co/react/shared';
import { sepolia } from '@reown/appkit/networks';
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

// The participation flow runs on the env-driven demo chain (mainnet by
// default; see `@/lib/chain`); the SDK's checkout providers ship Sepolia-only
// contracts today. Both networks are registered so a single AppKit connection
// can serve either - each flow switches the wallet to the chain it needs.
// Dedupe in case the demo chain is already Sepolia.
const networks =
  APPKIT_NETWORK === sepolia
    ? ([sepolia] as const)
    : ([APPKIT_NETWORK, sepolia] as const);

const wagmiAdapter = new WagmiAdapter({
  networks: [...networks],
  projectId,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [...networks],
  defaultNetwork: APPKIT_NETWORK,
  projectId,
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
