'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { ToastProvider } from '@/components/toast/Toast';
import { DemoCoinListProvider } from '@/lib/providers/CoinListProvider';
import { WalletConnectProvider } from '@/lib/providers/WalletConnectProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // The browser restores the previous scroll position after client
    // navigations, which leaves the site header off screen.
    history.scrollRestoration = 'manual';
    if (pathname) window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <WalletConnectProvider>
      <DemoCoinListProvider>
        <ToastProvider>{children}</ToastProvider>
      </DemoCoinListProvider>
    </WalletConnectProvider>
  );
}
