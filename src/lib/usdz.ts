'use client';

import { sepolia } from '@reown/appkit/networks';
import {
  switchChain,
  waitForTransactionReceipt,
  watchAsset,
  writeContract,
} from '@wagmi/core';
import { useCallback } from 'react';
import {
  type Address,
  BaseError,
  erc20Abi,
  parseAbi,
  parseUnits,
  UserRejectedRequestError,
} from 'viem';
import { useBalance, useConfig, useReadContract } from 'wagmi';

/** CoinList's test stablecoin. It exists only on Ethereum Sepolia. */
export const USDZ = {
  address: '0xE1d4F6579472a20bE2555e5C94C4f62480430133',
  symbol: 'USDZ',
  decimals: 6,
} as const;

export const DEFAULT_FAUCET_AMOUNT = '1000';
const MAX_FAUCET_AMOUNT = 1_000_000;

// The token lets anyone mint any amount to any address. This is the only
// function the faucet needs, so the ABI declares nothing else.
const USDZ_MINT_ABI = parseAbi(['function mint(address to, uint256 amount)']);

/**
 * Turns typed-in text into USDZ base units, or explains why it can't. The
 * upper limit is a demo choice; the token itself has none.
 */
export function parseFaucetAmount(
  input: string
): { ok: true; amount: bigint } | { ok: false; error: string } {
  const value = input.trim();
  if (!/^\d+(\.\d+)?$/.test(value)) {
    return { ok: false, error: 'Enter a number, like 1000.' };
  }
  const decimals = value.split('.')[1]?.length ?? 0;
  if (decimals > USDZ.decimals) {
    return {
      ok: false,
      error: `USDZ has at most ${USDZ.decimals} decimal places.`,
    };
  }
  const amount = parseUnits(value, USDZ.decimals);
  if (amount <= BigInt(0)) {
    return { ok: false, error: 'Enter an amount above 0.' };
  }
  if (amount > parseUnits(String(MAX_FAUCET_AMOUNT), USDZ.decimals)) {
    return {
      ok: false,
      error: `The faucet mints at most ${MAX_FAUCET_AMOUNT.toLocaleString('en-US')} USDZ at a time.`,
    };
  }
  return { ok: true, amount };
}

/** Whether the visitor dismissed the wallet's prompt rather than it failing. */
export function isUserRejection(error: unknown): boolean {
  return (
    error instanceof BaseError &&
    error.walk((cause) => cause instanceof UserRejectedRequestError) !== null
  );
}

/**
 * The connected wallet's USDZ and Sepolia ETH balances, plus the two wallet
 * actions the faucet offers. Every call targets Sepolia whatever network the
 * wallet is on, switching the wallet there first where a call needs it.
 */
export function useUsdzWallet(owner: Address | null) {
  const config = useConfig();
  const enabled = owner !== null;

  const usdz = useReadContract({
    address: USDZ.address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: owner ? [owner] : undefined,
    chainId: sepolia.id,
    query: { enabled },
  });
  const eth = useBalance({
    address: owner ?? undefined,
    chainId: sepolia.id,
    query: { enabled },
  });
  const refetchUsdz = usdz.refetch;

  /** Mints `amount` base units to the wallet and waits until it is mined. */
  const mint = useCallback(
    async (amount: bigint) => {
      if (!owner) throw new Error('No wallet is connected.');
      await switchChain(config, { chainId: sepolia.id });
      const hash = await writeContract(config, {
        address: USDZ.address,
        abi: USDZ_MINT_ABI,
        functionName: 'mint',
        args: [owner, amount],
        chainId: sepolia.id,
      });
      const receipt = await waitForTransactionReceipt(config, {
        hash,
        chainId: sepolia.id,
      });
      if (receipt.status !== 'success') {
        throw new Error('The mint transaction reverted.');
      }
      await refetchUsdz();
    },
    [config, owner, refetchUsdz]
  );

  /** Asks the wallet to list USDZ among its tokens. */
  const addToWallet = useCallback(async () => {
    await switchChain(config, { chainId: sepolia.id });
    await watchAsset(config, {
      type: 'ERC20',
      options: {
        address: USDZ.address,
        symbol: USDZ.symbol,
        decimals: USDZ.decimals,
      },
    });
  }, [config]);

  return {
    usdzBalance: usdz.data,
    ethBalance: eth.data?.value,
    mint,
    addToWallet,
  };
}
