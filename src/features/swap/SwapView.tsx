'use client';

import { ArrowLeft } from 'lucide-react';
import { AmountStep } from '@/features/swap/components/AmountStep';
import { AuthorizeStep } from '@/features/swap/components/AuthorizeStep';
import { OrderConfirmedDialog } from '@/features/swap/components/OrderConfirmedDialog';
import { ReviewStep } from '@/features/swap/components/ReviewStep';
import { SwapSidebar } from '@/features/swap/components/SwapSidebar';
import { SwapStepCard } from '@/features/swap/components/SwapStepCard';
import type {
  SwapUiEvent,
  SwapUiState,
} from '@/features/swap/useSwapViewModel';
import { formatCountdown } from '@/lib/countdown';

interface Props {
  state: SwapUiState;
  onEvent: (event: SwapUiEvent) => void;
}

export function SwapView({ state, onEvent }: Props) {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-8 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto mb-8 flex w-full max-w-5xl items-center justify-between">
        <button
          type="button"
          onClick={() => onEvent({ type: 'ON_BACK' })}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ArrowLeft size={16} />
          Back to deal page
        </button>
        {state.type === 'CONTENT' && state.endsAt && (
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Ends in {formatCountdown(state.endsAt)}
          </div>
        )}
      </div>

      {state.type === 'ERROR' ? (
        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            This swap is unavailable right now. Please try again later.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_300px]">
            <div className="flex flex-col gap-4">
              <SwapStepCard
                index={1}
                title="Authorize wallet"
                status={state.authorize.status}
                summary={state.authorize.confirmedAddress}
                onEdit={() => onEvent({ type: 'ON_EDIT_AUTHORIZE' })}
              >
                <AuthorizeStep state={state.authorize} onEvent={onEvent} />
              </SwapStepCard>

              <SwapStepCard
                index={2}
                title="Enter amount"
                status={state.amount.status}
                summary={state.amount.summary}
                onEdit={() => onEvent({ type: 'ON_EDIT_AMOUNT' })}
              >
                <AmountStep state={state.amount} onEvent={onEvent} />
              </SwapStepCard>

              <SwapStepCard
                index={3}
                title="Review order"
                status={state.review.status}
              >
                <ReviewStep state={state.review} onEvent={onEvent} />
              </SwapStepCard>
            </div>

            <SwapSidebar state={state.sidebar} />
          </div>

          <OrderConfirmedDialog
            order={state.confirmedOrder}
            onEvent={onEvent}
          />
        </>
      )}
    </div>
  );
}
