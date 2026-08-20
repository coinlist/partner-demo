'use client';

import type {
  CheckoutConfig,
  CheckoutWalletSelection,
} from '@coinlist-co/react';
import type { EthereumChain, OfferDetail } from '@coinlist-co/react/shared';
import { DEMO_CHAIN } from '@/lib/chain';
import { CHECKOUT_CONFIG } from '@/lib/checkout-config';
import { useCheckoutWallets } from '@/lib/checkout-wallets';

export type OfferCheckoutUiState = {
  /** The offer being bought. Its `type` is what picks the provider's flow. */
  offerDetail: OfferDetail;
  /** The chain the order executes on: balances, approval and broadcast. */
  chain: EthereumChain;
  /** The wallets the buyer can spend from, and how to connect one. */
  wallets: CheckoutWalletSelection;
  /** What each offer type needs beyond the offer itself. */
  config: CheckoutConfig;
  /** Drives the "Ends in …" badge; `null` for an offer with no end date. */
  endsAt: Date | null;
};

export type OfferCheckoutUiEvent = { type: 'ON_BACK' };

export interface UseOfferCheckoutViewModelOptions {
  offerDetail: OfferDetail;
  /** Returns to the offer details page. Owned by the offer feature. */
  onBack: () => void;
}

/**
 * Assembles the four things `CheckoutContainer` cannot work out for itself and
 * hands them to the View.
 *
 * There is no flow state here, and that is the point of the SDK: the wallet
 * step, the amount step, the quote polling, the approval and the broadcast all
 * live in `CheckoutContainer`. This viewmodel is the whole integration surface
 * a partner writes.
 *
 * The checkout is mounted only while it is on screen, so it needs no `enabled`
 * flag - a host that keeps it mounted behind a tab would pass
 * `enabled={false}` to stop its requests and timers.
 */
export function useOfferCheckoutViewModel({
  offerDetail,
  onBack,
}: UseOfferCheckoutViewModelOptions): {
  state: OfferCheckoutUiState;
  onEvent: (event: OfferCheckoutUiEvent) => void;
} {
  const wallets = useCheckoutWallets();

  const state: OfferCheckoutUiState = {
    offerDetail,
    chain: DEMO_CHAIN,
    wallets,
    config: CHECKOUT_CONFIG,
    endsAt: offerDetail.endsAt,
  };

  const onEvent = (event: OfferCheckoutUiEvent) => {
    switch (event.type) {
      case 'ON_BACK':
        onBack();
        break;
    }
  };

  return { state, onEvent };
}
