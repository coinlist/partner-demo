'use client';

import { ErrorBanner } from '@/components/ErrorBanner';
import type { ReviewUi, SwapUiEvent } from '@/features/swap/useSwapViewModel';

interface Props {
  state: ReviewUi;
  onEvent: (event: SwapUiEvent) => void;
}

/** Step 3: review the live quote, pick slippage, and place the order. */
export function ReviewStep({ state, onEvent }: Props) {
  const selectedSlippage = state.slippageOptions.find(
    (option) => option.selected
  )?.label;

  return (
    <div>
      {state.quoteLoading || !state.rows ? (
        <QuoteSkeleton />
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <ReviewRow label="Subtotal" value={state.rows.subtotal} />
          <ReviewRow label="CoinList fee" value={state.rows.fee} />
          <ReviewRow label="Total" value={state.rows.total} emphasized />
          <ReviewRow label="You receive" value={state.rows.youReceive} />
          <ReviewRow label="Minimum received" value={state.rows.minReceived} />
          <ReviewRow label="Price per share" value={state.rows.pricePerShare} />
          <ReviewRow label="Delivered to" value={state.rows.recipient} />
        </div>
      )}

      <p className="mt-5 mb-2 text-sm text-zinc-500 dark:text-zinc-400">
        Max slippage
      </p>
      <div className="flex gap-2">
        {state.slippageOptions.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() =>
              onEvent({ type: 'ON_SLIPPAGE_SELECT', bps: option.bps })
            }
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
              option.selected
                ? 'border-zinc-900 bg-white text-zinc-900 ring-1 ring-zinc-900 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-100'
                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {selectedSlippage && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          If the price moves more than {selectedSlippage} before your order
          fills, it will be cancelled.
        </p>
      )}

      <button
        type="button"
        onClick={() => onEvent({ type: 'ON_PLACE_ORDER' })}
        disabled={!state.canPlaceOrder}
        className={`mt-5 w-full rounded-2xl py-3.5 text-sm font-semibold transition ${
          state.canPlaceOrder
            ? 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100'
            : 'cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-500'
        }`}
      >
        {state.busyLabel ?? 'Place order'}
      </button>

      {state.error && (
        <div className="mt-3">
          <ErrorBanner message={state.error} />
        </div>
      )}

      <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
        Final amounts may vary based on price at time of settlement. By placing
        this order you agree to the{' '}
        <a
          href={state.tosUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Superstate Terms of Service
        </a>
      </p>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span
        className={
          emphasized
            ? 'text-sm font-semibold text-zinc-900 dark:text-zinc-100'
            : 'text-sm text-zinc-500 dark:text-zinc-400'
        }
      >
        {label}
      </span>
      <span
        className={`text-right text-sm text-zinc-900 dark:text-zinc-100 ${
          emphasized ? 'font-semibold' : 'font-medium'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function QuoteSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-4 w-28 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}
