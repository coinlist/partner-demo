'use client';

import type { CheckoutWalletSelection, EvmWallet } from '@coinlist-co/react';
import { EvmWalletAddress } from '@coinlist-co/react/shared';
import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from '@reown/appkit/react';
import { useCallback, useMemo } from 'react';
import { useConfig, useWalletClient } from 'wagmi';
import { buildEvmWallet } from '@/lib/wagmiEvmWallet';

/**
 * The demo ships no custodial wallets, so the embedded list is always empty -
 * a normal state for the SDK, not an error. A partner who is a wallet provider
 * themselves would return their users' wallets here instead.
 *
 * Hoisted to module scope so its identity is stable: `CheckoutWalletSelection`
 * is read on every render of every checkout step, and a fresh `[]` each render
 * would invalidate the memo below for no reason.
 */
const NO_EMBEDDED_WALLETS: EvmWallet[] = [];

/**
 * Adapts the demo's AppKit/wagmi stack to the SDK's
 * {@link CheckoutWalletSelection} - the seam `CheckoutContainer` uses to spend
 * from a wallet without shipping a wallet stack of its own.
 *
 * Kept separate from {@link useEvmWallet}, which serves the requirements
 * checklist: that one hands the SDK a signing-only `ConnectWallet` for the
 * ownership challenge, while a checkout needs a full {@link EvmWallet} that can
 * approve, broadcast and await a receipt.
 *
 * No `chain` parameter, unlike `useEvmWallet`. The SDK's flows tell each
 * transaction which chain it targets and `buildEvmWallet` switches the wallet
 * there before signing, so the wallet itself is chain-agnostic. Which chain a
 * checkout runs on is `CheckoutContainer`'s `chain` prop.
 */
export function useCheckoutWallets(): CheckoutWalletSelection {
  const wagmiConfig = useConfig();
  const { address, isConnected } = useAppKitAccount();
  const { data: walletClient } = useWalletClient();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();

  const external = useMemo<EvmWallet | null>(() => {
    if (!(isConnected && address && walletClient)) return null;
    return buildEvmWallet({
      address: EvmWalletAddress(address),
      walletClient,
      config: wagmiConfig,
    });
  }, [address, isConnected, walletClient, wagmiConfig]);

  /**
   * AppKit's `open()` resolves when the modal opens, not when the user
   * finishes connecting. That is within the SDK's contract: it reads the
   * outcome from `external` on the next render rather than from this promise,
   * precisely so a host connecting through a redirect still works.
   */
  const connectExternal = useCallback(async () => {
    await open();
  }, [open]);

  const disconnectExternal = useCallback(async () => {
    await disconnect();
  }, [disconnect]);

  return useMemo(
    () => ({
      embedded: NO_EMBEDDED_WALLETS,
      external,
      connectExternal,
      disconnectExternal,
    }),
    [external, connectExternal, disconnectExternal]
  );
}
