'use client';

import type { WalletSelection } from '@coinlist-co/react/universal';
import { useMemo } from 'react';
import { useCheckoutWallets } from '@/lib/checkout-wallets';

/**
 * Adapts the demo's AppKit/wagmi stack to the SDK's {@link WalletSelection} -
 * the seam `ClaimContainer` reads positions for and claims from.
 *
 * The same wallets as {@link useCheckoutWallets}, without `preselected`: a
 * claim lists every wallet's positions at once, so there is nothing to pick.
 */
export function useClaimWallets(): WalletSelection {
  const { embedded, external, externalAdapter } = useCheckoutWallets();

  return useMemo(
    () => ({ embedded, external, externalAdapter }),
    [embedded, external, externalAdapter]
  );
}
