'use client';

import { Blockchain } from '@coinlist-co/react/shared';
import { mainnet } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { requiredEnv } from '@/lib/env';

export const ETHEREUM_CHAIN = Blockchain('ethereum_mainnet');

const projectId = requiredEnv(
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
);

const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet],
  projectId,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet],
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
