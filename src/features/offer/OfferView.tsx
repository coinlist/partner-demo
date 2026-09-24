'use client';

import { ArrowLeft } from 'lucide-react';
import {
  OfferDetailsCard,
  SectionDivider,
} from '@/features/offer/components/OfferDetailsCard';
import { OfferFaq } from '@/features/offer/components/OfferFaq';
import { OfferMilestones } from '@/features/offer/components/OfferMilestones';
import { OfferRequirementsCard } from '@/features/offer/components/OfferRequirementsCard';
import type {
  OfferUiEvent,
  OfferUiState,
} from '@/features/offer/useOfferViewModel';

export interface Props {
  state: OfferUiState;
  onEvent: (event: OfferUiEvent) => void;
}

export function OfferView({ state, onEvent }: Props) {
  if (state.type === 'LOADING') {
    return (
      <div className="min-h-screen bg-white px-6 py-8 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
        <div className="mx-auto grid w-full max-w-5xl animate-pulse grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,11fr)_minmax(0,8fr)] md:gap-x-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-900" />
              <div className="h-7 w-48 rounded-md bg-zinc-200 dark:bg-zinc-900" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full rounded-md bg-zinc-200 dark:bg-zinc-900" />
              <div className="h-4 w-4/5 rounded-md bg-zinc-200 dark:bg-zinc-900" />
              <div className="h-4 w-2/3 rounded-md bg-zinc-200 dark:bg-zinc-900" />
            </div>
          </div>
          <div className="space-y-3 rounded-[24px] border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="mb-3 h-4 w-36 rounded-md bg-zinc-200 dark:bg-zinc-900" />
            <div className="h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-900" />
            <div className="h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-900" />
            <div className="mt-3 h-11 rounded-full bg-zinc-200 dark:bg-zinc-900" />
          </div>
        </div>
      </div>
    );
  }

  if (state.type === 'ERROR') {
    return (
      <div className="min-h-screen bg-white px-6 py-8 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
          <h1 className="text-lg font-semibold text-red-700 dark:text-red-200">
            Could not load offer
          </h1>
          <p className="mt-2 text-sm text-red-600/90 dark:text-red-200/90">
            {state.message}
          </p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => onEvent({ type: 'ON_BACK_CLICK' })}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <ArrowLeft size={16} />
              Back to offers
            </button>
            {!state.isAuthError ? (
              <button
                type="button"
                onClick={() => onEvent({ type: 'ON_RETRY_CLICK' })}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Retry
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid w-full items-start grid-cols-1 gap-6 md:grid-cols-[minmax(0,11fr)_minmax(0,8fr)] md:gap-x-12">
          <div className="flex min-w-0 flex-col gap-8">
            <OfferDetailsCard
              name={state.name}
              symbol={state.symbol}
              tagline={state.tagline}
              logoUrl={state.logoUrl}
              about={state.about}
              terms={state.terms}
              links={state.links}
              isTokenSale={state.isTokenSale}
            />
            {state.milestones.length > 0 ? (
              <>
                <SectionDivider />
                <OfferMilestones milestones={state.milestones} />
              </>
            ) : null}
            {state.faqs.length > 0 ? (
              <>
                <SectionDivider />
                <OfferFaq faqs={state.faqs} />
              </>
            ) : null}
          </div>

          <OfferRequirementsCard
            offerId={state.offerId}
            options={state.options}
            selectedOptionId={state.selectedOptionId}
            onOptionSelect={(optionId) =>
              onEvent({ type: 'ON_OPTION_SELECT', optionId })
            }
            onContinue={() => onEvent({ type: 'ON_INVEST_CLICK' })}
          />
        </div>
      </div>
    </div>
  );
}
