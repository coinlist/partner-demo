'use client';

import { RequirementsChecklist } from '@coinlist-co/react';
import type { OfferId, OfferOptionId } from '@coinlist-co/react/shared';
import { ArrowLeft } from 'lucide-react';
import { OfferBanner } from '@/features/offer/components/OfferBanner';
import { OfferFaq } from '@/features/offer/components/OfferFaq';
import { OfferHeader } from '@/features/offer/components/OfferHeader';
import { OfferLink } from '@/features/offer/components/OfferLink';
import { OfferMilestones } from '@/features/offer/components/OfferMilestones';
import { OfferParticipations } from '@/features/offer/components/OfferParticipations';
import { OfferSidebarCard } from '@/features/offer/components/OfferSidebarCard';
import { OfferTerms } from '@/features/offer/components/OfferTerms';
import type {
  OfferUiEvent,
  OfferUiOption,
  OfferUiState,
  ParticipationsUiState,
} from '@/features/offer/useOfferViewModel';
import { isSwapOffer } from '@/features/swap/constants';
import { useEvmWallet } from '@/lib/evm-wallet';

export interface Props {
  state: OfferUiState;
  onEvent: (event: OfferUiEvent) => void;
}

export function OfferView({ state, onEvent }: Props) {
  if (state.type === 'LOADING') {
    return (
      <div className="min-h-screen bg-zinc-50 px-6 py-8 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
        <div className="mx-auto w-full max-w-6xl animate-pulse space-y-4">
          <div className="h-40 rounded-2xl bg-zinc-200 dark:bg-zinc-900" />
          <div className="h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-900" />
          <div className="h-56 rounded-2xl bg-zinc-200 dark:bg-zinc-900" />
        </div>
      </div>
    );
  }

  if (state.type === 'ERROR') {
    return (
      <div className="min-h-screen bg-zinc-50 px-6 py-8 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
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
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
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
    <div className="min-h-screen bg-zinc-50 px-6 py-8 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <button
          type="button"
          onClick={() => onEvent({ type: 'ON_BACK_CLICK' })}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <ArrowLeft size={16} />
          Back to offers
        </button>

        <OfferBanner name={state.name} bannerUrl={state.bannerUrl} />

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <div className="lg:hidden space-y-6">
              <SidebarContent
                tokenCode={state.tokenCode}
                tokenPriceUsd={state.tokenPriceUsd}
                offerId={state.offerId}
                options={state.options}
                selectedOptionId={state.selectedOptionId}
                participationsState={state.participationsState}
                showParticipations={state.showParticipations}
                onOptionSelect={(optionId) =>
                  onEvent({ type: 'ON_OPTION_SELECT', optionId })
                }
                onContinue={() => onEvent({ type: 'ON_INVEST_CLICK' })}
              />
            </div>

            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-none">
              <OfferHeader
                name={state.name}
                tagline={state.tagline}
                logoUrl={state.logoUrl}
              />
              <div className="mt-5">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  About
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {state.about ?? 'No description available yet.'}
                </p>
              </div>
              {state.links.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {state.links.map((link) => (
                    <OfferLink key={link.label + link.url} link={link} />
                  ))}
                </div>
              ) : null}
            </section>

            {state.terms.length > 0 ? <OfferTerms terms={state.terms} /> : null}
            {state.milestones.length > 0 ? (
              <OfferMilestones milestones={state.milestones} />
            ) : null}
            {state.faqs.length > 0 ? <OfferFaq faqs={state.faqs} /> : null}
          </div>

          <div className="hidden lg:block space-y-6">
            <SidebarContent
              tokenCode={state.tokenCode}
              tokenPriceUsd={state.tokenPriceUsd}
              offerId={state.offerId}
              options={state.options}
              selectedOptionId={state.selectedOptionId}
              participationsState={state.participationsState}
              showParticipations={state.showParticipations}
              onOptionSelect={(optionId) =>
                onEvent({ type: 'ON_OPTION_SELECT', optionId })
              }
              onContinue={() => onEvent({ type: 'ON_INVEST_CLICK' })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  tokenCode,
  tokenPriceUsd,
  offerId,
  options,
  selectedOptionId,
  participationsState,
  showParticipations,
  onOptionSelect,
  onContinue,
}: {
  tokenCode: string;
  tokenPriceUsd: string | null;
  offerId: OfferId;
  options: OfferUiOption[];
  selectedOptionId: OfferOptionId | null;
  participationsState: ParticipationsUiState;
  showParticipations: boolean;
  onOptionSelect: (optionId: OfferOptionId) => void;
  onContinue: () => void;
}) {
  const { connectWallet, connect } = useEvmWallet();
  return (
    <>
      <OfferSidebarCard
        statusText={isSwapOffer(offerId) ? 'Swap' : 'Token Sale'}
        tokenCode={tokenCode}
        tokenPriceUsd={tokenPriceUsd != null ? Number(tokenPriceUsd) : null}
      />
      {options.length > 1 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-none">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Options
          </p>
          <div className="flex flex-col gap-2">
            {options.map((opt) => (
              <button
                key={opt.id.toString()}
                type="button"
                onClick={() => onOptionSelect(opt.id)}
                className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                  opt.id === selectedOptionId
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="capitalize">
                  {opt.slug.replace(/-/g, ' ')}
                </span>
                {opt.priceUsd ? (
                  <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                    ${opt.priceUsd}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {selectedOptionId ? (
        <RequirementsChecklist
          offerId={offerId}
          optionId={selectedOptionId}
          title="Requirements"
          description="Complete these steps to participate in the token sale."
          onContinue={onContinue}
          wallet={connectWallet}
          onRequestConnect={connect}
        />
      ) : null}
      {showParticipations ? (
        <OfferParticipations state={participationsState} />
      ) : null}
    </>
  );
}
