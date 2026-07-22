'use client';

import { ChevronRight, Wallet, X } from 'lucide-react';
import type {
  AuthorizeUi,
  SwapUiEvent,
} from '@/features/swap/useSwapViewModel';

interface Props {
  state: AuthorizeUi;
  onEvent: (event: SwapUiEvent) => void;
}

/**
 * Step 1: connect an external wallet and prove ownership so the SDK can
 * allow-list it for the offer's swap contract.
 */
export function AuthorizeStep({ state, onEvent }: Props) {
  return (
    <div>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        Connect your wallet and authorize it to trade this fund.
      </p>

      {state.connectedAddress ? (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <Wallet size={18} className="text-zinc-500 dark:text-zinc-400" />
          <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {state.connectedAddress}
          </span>
          <button
            type="button"
            onClick={() => onEvent({ type: 'ON_DISCONNECT_WALLET' })}
            className="text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="Disconnect wallet"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onEvent({ type: 'ON_CONNECT_WALLET' })}
          className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-left transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <Wallet size={18} className="text-zinc-500 dark:text-zinc-400" />
          <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Connect wallet
          </span>
          <ChevronRight size={16} className="text-zinc-400" />
        </button>
      )}

      <button
        type="button"
        onClick={() => onEvent({ type: 'ON_CONFIRM_WALLET' })}
        disabled={!state.canConfirm}
        className={`mt-5 w-full rounded-2xl py-3.5 text-sm font-semibold transition ${
          state.canConfirm
            ? 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100'
            : 'cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-500'
        }`}
      >
        {state.busyLabel ?? 'Authorize wallet'}
      </button>

      {state.error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </div>
  );
}
