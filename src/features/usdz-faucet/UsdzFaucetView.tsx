'use client';

import { Droplets, Wallet } from 'lucide-react';
import { InlineErrorText } from '@/components/InlineErrorText';
import type {
  UsdzFaucetUiEvent,
  UsdzFaucetUiState,
} from '@/features/usdz-faucet/useUsdzFaucetViewModel';

const SEPOLIA_ETH_FAUCET_HREF =
  'https://cloud.google.com/application/web3/faucet/ethereum/sepolia';

export interface Props {
  state: UsdzFaucetUiState;
  onEvent: (event: UsdzFaucetUiEvent) => void;
}

const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300';

const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800';

export function UsdzFaucetView({ state, onEvent }: Props) {
  return (
    <div className="min-h-screen bg-white px-6 py-10 font-sans dark:bg-black">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <Droplets size={14} />
            Faucet
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Get USDZ
          </h1>
          <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            USDZ is CoinList's test stablecoin on Ethereum Sepolia, used to pay
            for many offers. Mint some to your wallet so you can check out.
          </p>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {state.walletAddress ? (
            <ConnectedFaucet state={state} onEvent={onEvent} />
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Connect a wallet to mint USDZ to it.
              </p>
              <button
                type="button"
                onClick={() => onEvent({ type: 'ON_CONNECT' })}
                className={primaryButton}
              >
                <Wallet size={16} />
                Connect wallet
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ConnectedFaucet({ state, onEvent }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Your USDZ balance
        </span>
        <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {state.usdzBalance ?? '…'} USDZ
        </span>
        <span className="break-all font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {state.walletAddress}
        </span>
      </div>

      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          onEvent({ type: 'ON_MINT' });
        }}
      >
        <label
          htmlFor="usdz-amount"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Amount
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              id="usdz-amount"
              inputMode="decimal"
              autoComplete="off"
              value={state.amountInput}
              onChange={(event) =>
                onEvent({ type: 'ON_AMOUNT_CHANGE', value: event.target.value })
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-16 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-zinc-500">
              USDZ
            </span>
          </div>
          <button
            type="submit"
            disabled={state.minting || state.amountError !== null}
            className={primaryButton}
          >
            <Droplets size={16} />
            {state.minting ? 'Minting…' : 'Mint USDZ'}
          </button>
        </div>
        <InlineErrorText message={state.amountError} />
      </form>

      {state.needsSepoliaEth && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          Your wallet has no Sepolia ETH to pay gas for the mint.{' '}
          <a
            href={SEPOLIA_ETH_FAUCET_HREF}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline"
          >
            Get Sepolia ETH
          </a>{' '}
          first.
        </p>
      )}

      <div>
        <button
          type="button"
          onClick={() => onEvent({ type: 'ON_ADD_TO_WALLET' })}
          className={secondaryButton}
        >
          <Wallet size={16} />
          Add USDZ to wallet
        </button>
      </div>
    </div>
  );
}
