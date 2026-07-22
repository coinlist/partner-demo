import type { EvmWallet } from '@coinlist-co/react';
import type {
  EthereumChain,
  EvmWalletAddress,
} from '@coinlist-co/react/shared';
import {
  type Config,
  getChainId,
  switchChain,
  waitForTransactionReceipt,
} from '@wagmi/core';
import { type Chain, encodeFunctionData, type WalletClient } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

/**
 * Maps the SDK's `EthereumChain` to the viem chain the wallet must be on. The
 * swap flows tell the adapter which chain each transaction targets; the adapter
 * switches the wallet there before signing.
 */
const CHAINS: Record<EthereumChain, Chain> = {
  ethereum_mainnet: mainnet,
  ethereum_sepolia: sepolia,
};

/**
 * Adapts an AppKit/wagmi wallet to the SDK's `EvmWallet` interface so the swap
 * flows (`authorizeWallet`, `executeSwap`) can drive it. The SDK is
 * wallet-agnostic: it only needs message signing, contract writes, raw-tx
 * broadcast, and receipt confirmation, which we implement over viem + wagmi.
 *
 * Errors thrown by the wallet propagate as-is — the SDK classifies them into a
 * typed `WalletError` (user rejected, insufficient funds, revert, …).
 */
export function buildEvmWallet({
  address,
  walletClient,
  config,
}: {
  address: EvmWalletAddress;
  walletClient: WalletClient;
  config: Config;
}): EvmWallet {
  const account = address as `0x${string}`;

  const ensureChain = async (chain: EthereumChain): Promise<Chain> => {
    const target = CHAINS[chain];
    if (getChainId(config) !== target.id) {
      await switchChain(config, { chainId: target.id });
    }
    return target;
  };

  return {
    address,
    signMessage: (message) => walletClient.signMessage({ account, message }),
    async writeContract({
      abi,
      address: to,
      functionName,
      args,
      value,
      chain,
    }) {
      const targetChain = await ensureChain(chain);
      const data = encodeFunctionData({ abi, functionName, args });
      return walletClient.sendTransaction({
        account,
        chain: targetChain,
        to,
        data,
        value,
      });
    },
    async broadcastRawTx({ to, data, chain }) {
      const targetChain = await ensureChain(chain);
      return walletClient.sendTransaction({
        account,
        chain: targetChain,
        to,
        data,
      });
    },
    awaitTx: (hash, chain) =>
      waitForTransactionReceipt(config, { hash, chainId: CHAINS[chain].id }),
  };
}
