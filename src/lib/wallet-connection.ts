'use client';

import type { WalletConnection } from '@passage-cl/react';
import { type EvmWallet, EvmWalletAddress } from '@passage-cl/react/universal';
import { useMemo } from 'react';
import { useAccount, useConfig, useWalletClient } from 'wagmi';
import { ethereumChainOf } from '@/lib/chain';
import { buildEvmWallet } from '@/lib/wagmiEvmWallet';

/**
 * The connected wallet, or `null` until one is connected and its client has
 * loaded.
 */
export function useConnectedWallet(): EvmWallet | null {
  const wagmiConfig = useConfig();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    if (!(isConnected && address && walletClient)) return null;
    return buildEvmWallet({
      address: EvmWalletAddress(address),
      walletClient,
      config: wagmiConfig,
    });
  }, [address, isConnected, walletClient, wagmiConfig]);
}

/**
 * wagmi's connection state, for the SDK to end a wallet session on a
 * disconnect, an address change or a network change.
 *
 * On a reload wagmi reconnects the stored wallet after the first render, so
 * `reconnecting` must reach the SDK as `connecting`. Reported as
 * `disconnected`, it would sign the user out on every reload.
 */
export function useWalletConnection(): WalletConnection {
  const { address, chainId, status } = useAccount();
  return useMemo((): WalletConnection => {
    switch (status) {
      case 'connected': {
        if (!(address && chainId)) return { type: 'connecting' };
        const chain = ethereumChainOf(chainId);
        // A wallet on a network the SDK cannot sign in on has no session to
        // keep, so it reads as disconnected.
        if (!chain) return { type: 'disconnected' };
        return { type: 'connected', address: EvmWalletAddress(address), chain };
      }
      case 'disconnected':
        return { type: 'disconnected' };
      case 'connecting':
      case 'reconnecting':
        return { type: 'connecting' };
    }
  }, [address, chainId, status]);
}
