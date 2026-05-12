'use client';

import { DemoCoinListProvider } from '@/lib/providers/CoinListProvider';
import { WalletConnectProvider } from '@/lib/providers/WalletConnectProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletConnectProvider>
      <DemoCoinListProvider>{children}</DemoCoinListProvider>
    </WalletConnectProvider>
  );
}
