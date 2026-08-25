'use client';

import { CheckoutContainer } from '@coinlist-co/react';
import { DealFlowHeader } from '@/components/DealFlowHeader';
import type {
  OfferCheckoutUiEvent,
  OfferCheckoutUiState,
} from '@/features/checkout/useOfferCheckoutViewModel';

interface Props {
  state: OfferCheckoutUiState;
  onEvent: (event: OfferCheckoutUiEvent) => void;
}

/**
 * The checkout screen: the demo's page chrome wrapped around the SDK's
 * `CheckoutContainer`.
 *
 * The chrome is deliberately all there is. The SDK's provider Views ship no
 * page heading and no back button - they cannot know what they are mounted in
 * or where "back" goes - so titling and navigating the page is the host's half
 * of the contract, and this is the whole of it.
 *
 * `CheckoutContainer` lays itself out as steps beside a sale panel, stacking on
 * a phone, and fills whatever width it is given. It also scopes its own styles,
 * so it renders correctly inside the demo's Tailwind without a provider in the
 * tree.
 */
export function OfferCheckoutView({ state, onEvent }: Props) {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-8 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <DealFlowHeader
        backLabel="Back to deal page"
        onBack={() => onEvent({ type: 'ON_BACK' })}
        endsAt={state.endsAt}
      />

      <div className="mx-auto w-full min-w-0 max-w-5xl">
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
