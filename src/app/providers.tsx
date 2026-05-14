'use client';

import { ToastProvider } from '@/components/toast/Toast';
import { DemoCoinListProvider } from '@/lib/providers/CoinListProvider';
import { WalletConnectProvider } from '@/lib/providers/WalletConnectProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletConnectProvider>
      <DemoCoinListProvider>
        <ToastProvider>{children}</ToastProvider>
      </DemoCoinListProvider>
    </WalletConnectProvider>
  );
}
