'use client';

import type { ConnectWallet } from '@coinlist-co/react';
import type { EthereumChain } from '@coinlist-co/react/shared';
import { EvmWalletAddress } from '@coinlist-co/react/shared';
import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from '@reown/appkit/react';
import { signMessage } from '@wagmi/core';
import { useCallback, useMemo } from 'react';
import { useConfig } from 'wagmi';
import { DEMO_CHAIN } from '@/lib/chain';

/**
 * The demo's EVM wallet, as consumed by the app.
 *
 * `connectWallet` is the SDK's signing-only {@link ConnectWallet} contract
 * (address + chain + `signMessage`), or `null` while nothing is connected. The
 * rest is the wallet lifecycle the SDK deliberately leaves to the host:
 * connect/disconnect and account state.
 */
export interface UseEvmWalletResult {
  /** Connected account (branded), or `null` when no wallet is connected. */
  readonly address: EvmWalletAddress | null;
  readonly isConnected: boolean;
  /** The EVM chain the ownership signature is proven on (see {@link DEMO_CHAIN}). */
  readonly chain: EthereumChain;
  /** Opens the AppKit modal to connect (or switch) a wallet. */
  connect: () => void;
  /** Disconnects the active wallet. Rejects if the underlying disconnect fails. */
  disconnect: () => Promise<void>;
  /**
   * The SDK's {@link ConnectWallet} contract, or `null` while disconnected.
   * Memoized on the connected address: the SDK's ConnectWalletModal keys its
   * reset on `wallet.address`, and a fresh object each render would churn the
   * modal mid-sign.
   */
  readonly connectWallet: ConnectWallet | null;
}

/**
 * The single seam between the demo and its AppKit/wagmi wallet stack. Every
 * external-wallet interaction (connect, disconnect, account state, signing)
 * routes through here, so the rest of the app never imports AppKit or wagmi
 * directly and the SDK stays wallet-stack agnostic.
 *
 * Scope is the connect-wallet / ownership-signature lifecycle only. Spending
 * from a wallet is a different contract: the invest flow and the SDK's
 * checkout both need a full `EvmWallet` that can approve, broadcast and await
 * a receipt, which is what {@link buildEvmWallet} and
 * {@link useCheckoutWallets} provide.
 *
 * `chain` is the EVM chain the ownership signature is proven on and defaults
 * to {@link DEMO_CHAIN}. It is a parameter rather than a constant so a flow
 * running on a different chain can still prove ownership through this seam
 * instead of reaching for AppKit/wagmi directly.
 */
export function useEvmWallet(
  chain: EthereumChain = DEMO_CHAIN
): UseEvmWalletResult {
  const wagmiConfig = useConfig();
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const { disconnect: appKitDisconnect } = useDisconnect();

  const evmAddress = useMemo<EvmWalletAddress | null>(
    () => (isConnected && address ? EvmWalletAddress(address) : null),
    [address, isConnected]
  );

  const connect = useCallback(() => open(), [open]);

  const disconnect = useCallback(async () => {
    await appKitDisconnect();
  }, [appKitDisconnect]);

  const connectWallet = useMemo<ConnectWallet | null>(() => {
    if (!evmAddress) return null;
    return {
      address: evmAddress,
      // Wallet-connect uses the SDK's strict EthereumChain vocab, distinct from
      // the participation flow's Blockchain brand.
      chain,
      // Bare delegation to the connected account; the SDK catches rejections
      // and classifies them into a typed ConnectWalletErrorCode.
      signMessage: (message: string) => signMessage(wagmiConfig, { message }),
    };
  }, [evmAddress, wagmiConfig, chain]);

  return {
    address: evmAddress,
    isConnected,
    chain,
    connect,
    disconnect,
    connectWallet,
  };
}
