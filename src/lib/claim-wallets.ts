'use client';

import type { WalletSelection } from '@coinlist-co/react';
import { useMemo } from 'react';
import { useCheckoutWallets } from '@/lib/checkout-wallets';

/**
 * Adapts the demo's AppKit/wagmi stack to the SDK's {@link WalletSelection} -
 * the seam `ClaimContainer` reads positions for and claims from.
 *
 * The same wallets as {@link useCheckoutWallets}, reshaped: a claim takes its
 * connector as one `externalAdapter` rather than two callbacks, and has no
 * `preselected` because it lists every wallet's positions at once.
 */
export function useClaimWallets(): WalletSelection {
  const { embedded, external, connectExternal, disconnectExternal } =
    useCheckoutWallets();

  return useMemo(
    () => ({
      embedded,
      external,
      externalAdapter: {
        connect: connectExternal,
        disconnect: disconnectExternal,
      },
    }),
    [embedded, external, connectExternal, disconnectExternal]
  );
}
