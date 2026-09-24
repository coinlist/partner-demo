'use client';

import { CheckoutContainer } from '@coinlist-co/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import type { OfferCheckoutUiState } from '@/features/checkout/useOfferCheckoutViewModel';

interface Props {
  state: OfferCheckoutUiState;
  onBack: () => void;
}

/**
 * The checkout screen: the demo's page chrome wrapped around the SDK's
 * `CheckoutContainer`.
 *
 * The SDK checkout renders its own steps and sale panel, including its end
 * time. This view only supplies the page around it.
 *
 * `CheckoutContainer` lays itself out as steps beside a sale panel, stacking on
 * a phone, and fills whatever width it is given. It also scopes its own styles,
 * so it renders correctly inside the demo's Tailwind without a provider in the
 * tree.
 */
export function OfferCheckoutView({ state, onBack }: Props) {
  // Checkout replaces the deal page on the same URL, so the window would
  // otherwise stay scrolled past the site header.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white px-6 py-8 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="relative mx-auto w-full min-w-0 max-w-5xl">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to deal page"
          className="absolute top-0 left-0 hidden h-11 w-11 -translate-x-[calc(100%+32px)] cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 lg:inline-flex dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <ArrowLeft size={20} />
        </button>
        <CheckoutContainer
          offer={state.offerDetail}
          chain={state.chain}
          wallets={state.wallets}
          config={state.config}
        />
      </div>
    </div>
  );
}
