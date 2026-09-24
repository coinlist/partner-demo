'use client';

import { OfferSaleCard, OfferSaleCardUi } from '@coinlist-co/react';
import type { Offer } from '@coinlist-co/react/universal';
import type { ReactNode } from 'react';
import { OndoOfferAssetCard } from '@/features/home/OndoOfferAssetCard';
import type {
  HomeUiEvent,
  HomeUiState,
} from '@/features/home/useHomeViewModel';

export interface Props {
  state: HomeUiState;
  onEvent: (event: HomeUiEvent) => void;
}

export function HomeView({ state, onEvent }: Props) {
  const onOfferClick = (offer: Offer) => {
    onEvent({ type: 'ON_OFFER_CLICK', offer });
  };

  return (
    <div className="min-h-screen bg-white px-6 pt-6 pb-16 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto w-full max-w-3xl">
        {state.isEmpty ? (
          <p className="mt-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No offers available right now.
          </p>
        ) : (
          <div className="mt-8 flex flex-col gap-16">
            {state.tokenSaleOffers.length > 0 ? (
              <OfferSection
                title="Token Sale"
                description="Offer your users access to CoinList token sales, embedded inside your app, with direct token allocation on each sale's terms."
                docsHref="https://docs.passage.coinlist.co/use-cases/token-sales"
              >
                {state.tokenSaleOffers.map((offer) => (
                  <OfferSaleCard
                    key={offer.id.toString()}
                    offer={OfferSaleCardUi.fromOffer(offer)}
                    onClick={() => onOfferClick(offer)}
                  />
                ))}
              </OfferSection>
            ) : null}

            {state.ondoOffers.length > 0 ? (
              <OfferSection
                title="Tokenized Equities from Ondo"
                description="A broad catalog of 400+ tokenized assets across equities, fixed income, and commodities. Ondo assets are only available to non-US investors."
                docsHref="https://docs.passage.coinlist.co/use-cases/tokenized-assets"
              >
                <div className="flex w-full flex-col gap-3">
                  {state.ondoOffers.map((offer) => (
                    <OndoOfferAssetCard
                      key={offer.id.toString()}
                      offer={offer}
                      onClick={() => onOfferClick(offer)}
                    />
                  ))}
                </div>
              </OfferSection>
            ) : null}

            {state.superstateOffers.length > 0 ? (
              <OfferSection
                title="Tokenized Equities from Superstate"
                description="Tokenized US equities through Superstate's Opening Bell. Each token represents direct ownership of the underlying share."
                docsHref="https://docs.passage.coinlist.co/use-cases/tokenized-assets"
              >
                {state.superstateOffers.map((offer) => (
                  <OfferSaleCard
                    key={offer.id.toString()}
                    offer={OfferSaleCardUi.fromOffer(offer)}
                    onClick={() => onOfferClick(offer)}
                  />
                ))}
              </OfferSection>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function OfferSection({
  title,
  description,
  docsHref,
  children,
}: {
  title: string;
  description: string;
  docsHref: string;
  children: ReactNode;
}) {
  return (
    <section className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:gap-10">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-[22px] font-medium leading-[1.3] text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <p className="text-base leading-[1.6] text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        </div>
        {/* Title-aligned on desktop; full-width below the copy on mobile. */}
        <div className="flex shrink-0 sm:h-[calc(22px*1.3)] sm:items-center">
          <a
            href={docsHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            View in docs
          </a>
        </div>
      </div>
      <div className="flex w-full flex-col gap-4">{children}</div>
    </section>
  );
}
