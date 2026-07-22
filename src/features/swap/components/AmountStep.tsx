'use client';

import type { AmountUi, SwapUiEvent } from '@/features/swap/useSwapViewModel';

interface Props {
  state: AmountUi;
  onEvent: (event: SwapUiEvent) => void;
}

/** Step 2: enter the USD amount of USDC to swap. */
export function AmountStep({ state, onEvent }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Amount</p>
        {state.balanceLabel && (
          <button
            type="button"
            onClick={() => onEvent({ type: 'ON_MAX_CLICK' })}
            className="text-xs font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Balance: {state.balanceLabel} · Max
          </button>
        )}
      </div>

      <div className="flex items-center rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <span className="text-sm text-zinc-400">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={state.input}
          onChange={(e) =>
            onEvent({ type: 'ON_AMOUNT_CHANGE', value: e.target.value })
          }
          placeholder="0"
          className="flex-1 bg-transparent px-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
        />
      </div>

      {state.minPurchaseLabel && (
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          {state.minPurchaseLabel}
        </p>
      )}

      <button
        type="button"
        onClick={() => onEvent({ type: 'ON_PREVIEW_ORDER' })}
        disabled={!state.canContinue}
        className={`mt-5 w-full rounded-2xl py-3.5 text-sm font-semibold transition ${
          state.canContinue
            ? 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100'
            : 'cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-500'
        }`}
      >
        Preview order
      </button>

      {state.error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </div>
  );
}
