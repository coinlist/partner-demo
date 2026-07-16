'use client';

import type { Wallet } from '@coinlist-co/react';
import { EvmWalletAddress } from '@coinlist-co/react/shared';
import { useAppKitAccount } from '@reown/appkit/react';
import { signMessage } from '@wagmi/core';
import { useMemo } from 'react';
import { useConfig } from 'wagmi';

/**
 * Maps the demo's AppKit/wagmi connection onto the SDK's signer-agnostic
 * {@link Wallet} contract. Returns `null` when no wallet is connected so the
 * checklist can prompt the user to connect first.
 *
 * The returned object is memoized on the connected address: the SDK's
 * WalletConnectModal keys its reset on `wallet.address`, and a fresh object each
 * render would churn the modal mid-sign.
 */
export function useWalletAdapter(): Wallet | null {
  const wagmiConfig = useConfig();
  const { address, isConnected } = useAppKitAccount();

  return useMemo(() => {
    if (!isConnected || !address) return null;
    return {
      address: EvmWalletAddress(address as `0x${string}`),
      // Wallet-connect uses the SDK's strict EthereumChain vocab, distinct from
      // the participation flow's Blockchain brand. The demo runs on mainnet.
      chain: 'ethereum_mainnet',
      // First message-signing in the demo (all else is on-chain writeContract).
      // Bare delegation to the connected account; the SDK catches rejections.
      signMessage: (message: string) => signMessage(wagmiConfig, { message }),
    };
  }, [wagmiConfig, address, isConnected]);
}
