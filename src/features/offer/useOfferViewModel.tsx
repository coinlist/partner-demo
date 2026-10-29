'use client';

import {
  type LoadOfferDetailsState,
  OfferLogoUi,
  useOfferDetails,
  useTokenRegistry,
} from '@passage-cl/react';
import {
  AsyncOfferDetail,
  type OfferDetail,
  OfferId,
  type OfferOptionId,
  type OfferType,
  type OrderBookSide,
  TokenRegistrySnapshot,
} from '@passage-cl/react/universal';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ROUTES } from '@/lib/routes';

export type OfferUiLink = {
  label: string;
  url: string;
};

export type OfferUiTerm = {
  key: string;
  value: string;
};

export type OfferUiMilestone = {
  name: string;
  schedule: string;
  status: 'completed' | 'active' | 'upcoming';
};

export type OfferUiFaq = {
  question: string;
  answer: string;
};

export type OfferUiOption = {
  id: OfferOptionId;
  slug: string;
};

export type OfferUiState =
  | {
      type: 'LOADING';
    }
  | {
      type: 'ERROR';
      message: string;
      isAuthError: boolean;
    }
  | {
      type: 'CONTENT';
      offerId: OfferId;
      options: OfferUiOption[];
      selectedOptionId: OfferOptionId | null;
      name: string;
      symbol: string;
      tagline: string | null;
      /** Registry logo first, the offer's own artwork otherwise. */
      logo: OfferLogoUi | null;
      about: string | null;
      links: OfferUiLink[];
      terms: OfferUiTerm[];
      milestones: OfferUiMilestone[];
      faqs: OfferUiFaq[];
      isTokenSale: boolean;
      /**
       * Whether the offer can be sold as well as bought: a Centrifuge vault
       * redeems, an Ondo swap sells back.
       */
      canSell: boolean;
      /**
       * The offer when it settles asynchronously and so has orders to claim
       * later, `null` for one that settles in the purchase itself.
       */
      claimableOffer: AsyncOfferDetail | null;
    };

export type OfferUiEvent =
  | {
      type: 'ON_BACK_CLICK';
    }
  | {
      type: 'ON_RETRY_CLICK';
    }
  | {
      type: 'ON_OPTION_SELECT';
      optionId: OfferOptionId;
    }
  | {
      type: 'ON_INVEST_CLICK';
    }
  | {
      type: 'ON_SELL_CLICK';
    }
  | {
      type: 'ON_CHECKOUT_BACK';
    };

/**
 * Whether the checkout has taken over the page, and the offer it is ordering.
 *
 * A union rather than `{ active: boolean; offerDetail: OfferDetail | null }`,
 * so "open with nothing to order" cannot be built: the checkout can only open
 * once the offer has loaded. `side` is buy for a deposit and sell for a
 * redemption.
 */
export type OfferCheckoutState =
  | { type: 'CLOSED' }
  | {
      type: 'OPEN';
      offerDetail: OfferDetail;
      side: OrderBookSide;
      /**
       * The option the page shows as selected: the user's pick, otherwise the
       * offer's first. Token sales, Ondo swaps and Centrifuge vaults all send
       * it with the order. The SDK never picks one, so an offer with no
       * options has no checkout.
       */
      optionId: OfferOptionId;
    };

export function useOfferViewModel(): {
  state: OfferUiState;
  onEvent: (event: OfferUiEvent) => void;
  checkout: OfferCheckoutState;
} {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const [selectedOptionId, setSelectedOptionId] =
    useState<OfferOptionId | null>(null);
  const [checkoutSide, setCheckoutSide] = useState<OrderBookSide | null>(null);

  const offerId = parseRouteOfferId(params.id) ?? OfferId('');
  const { offerDetailsState } = useOfferDetails(offerId);
  // Fetched here rather than seeded: this page is client-rendered, and the
  // registry is public, so the browser can read it directly.
  const { state: registryState } = useTokenRegistry();
  const registry =
    registryState.type === 'CONTENT' ? registryState.registry : null;

  const state: OfferUiState = mapOfferUiState(
    offerId,
    offerDetailsState,
    selectedOptionId,
    registry
  );

  const offerDetail =
    offerDetailsState.type === 'CONTENT' ? offerDetailsState.offerDetail : null;

  const onEvent = (event: OfferUiEvent) => {
    switch (event.type) {
      case 'ON_BACK_CLICK':
        router.push(ROUTES.ROOT);
        break;
      case 'ON_RETRY_CLICK':
        router.refresh();
        break;
      case 'ON_OPTION_SELECT':
        setSelectedOptionId(event.optionId);
        break;
      case 'ON_INVEST_CLICK':
      case 'ON_SELL_CLICK': {
        // Nothing to order until the detail loads, and the button is only
        // reachable from the loaded view anyway.
        if (!offerDetail) break;
        // The SDK's CheckoutContainer runs every offer type in-page, token
        // sales included, so it does not matter which provider this is.
        setCheckoutSide(event.type === 'ON_SELL_CLICK' ? 'sell' : 'buy');
        break;
      }
      case 'ON_CHECKOUT_BACK':
        setCheckoutSide(null);
        break;
    }
  };

  const checkoutOptionId = offerDetail
    ? resolveOptionId(selectedOptionId, offerDetail.options)
    : null;

  return {
    state,
    onEvent,
    checkout:
      checkoutSide && offerDetail && checkoutOptionId
        ? {
            type: 'OPEN',
            offerDetail,
            optionId: checkoutOptionId,
            side: checkoutSide,
          }
        : { type: 'CLOSED' },
  };
}

function parseRouteOfferId(id: string | string[] | undefined): OfferId | null {
  if (!id) {
    return null;
  }

  if (Array.isArray(id)) {
    return OfferId(id[0]) ?? null;
  }

  return OfferId(id);
}

/** The user's pick, otherwise the offer's first option. */
function resolveOptionId(
  selectedOptionId: OfferOptionId | null,
  options: OfferDetail['options']
): OfferOptionId | null {
  return selectedOptionId ?? options[0]?.id ?? null;
}

function mapOfferUiState(
  routeOfferId: string | null,
  offerDetailsState: LoadOfferDetailsState,
  selectedOptionId: OfferOptionId | null,
  registry: TokenRegistrySnapshot | null
): OfferUiState {
  if (!routeOfferId) {
    return {
      type: 'ERROR',
      message: 'Offer ID is missing in the URL.',
      isAuthError: false,
    };
  }

  switch (offerDetailsState.type) {
    case 'LOADING':
      return {
        type: 'LOADING',
      };
    case 'ERROR':
      return {
        type: 'ERROR',
        message:
          offerDetailsState.reason === 'not-authenticated'
            ? 'Your session expired. Please sign in again.'
            : 'Could not load offer details. Please try again.',
        isAuthError: offerDetailsState.reason === 'not-authenticated',
      };
    case 'CONTENT': {
      const offerDetail = offerDetailsState.offerDetail;
      // Ondo swaps and Centrifuge vaults omit OfferEditorial (no campaign
      // copy).
      const tagline =
        offerDetail.type === 'ondo::swap' ||
        offerDetail.type === 'centrifuge::vault'
          ? null
          : offerDetail.tagline;
      const options = offerDetail.options.map((opt) => ({
        id: opt.id,
        slug: opt.slug.toString(),
      }));
      return {
        type: 'CONTENT',
        offerId: OfferId(routeOfferId),
        options,
        selectedOptionId: resolveOptionId(
          selectedOptionId,
          offerDetail.options
        ),
        name: offerDetail.name,
        symbol: offerDetail.asset.code.toString(),
        tagline,
        logo: OfferLogoUi.fromOffer(
          offerDetail,
          registry
            ? TokenRegistrySnapshot.forOffer(registry, offerDetail)
            : null
        ),
        about: offerDetail.about,
        links: offerDetail.links
          .filter((link) => Boolean(link.label && link.url))
          .map((link) => ({
            label: link.label ?? '',
            url: link.url ?? '',
          })),
        terms: offerDetail.terms
          .filter((term) => Boolean(term.key && term.value))
          .map((term) => ({
            key: term.key ?? '',
            value: term.value ?? '',
          })),
        milestones: offerDetail.milestones
          .filter((milestone) => Boolean(milestone.name && milestone.schedule))
          .map((milestone) => ({
            name: milestone.name ?? '',
            schedule: milestone.schedule ?? '',
            status: milestone.status,
          })),
        faqs: offerDetail.faqs
          .filter((faq) => Boolean(faq.question && faq.answer))
          .map((faq) => ({
            question: faq.question ?? '',
            answer: faq.answer ?? '',
          })),
        isTokenSale: offerDetail.type === 'coinlist::token_sale',
        canSell: isSellable(offerDetail.type),
        claimableOffer: AsyncOfferDetail.is(offerDetail) ? offerDetail : null,
      };
    }
  }
}

/**
 * The offer types the SDK's CheckoutContainer serves in the sell direction.
 * Exhaustive, so a new offer type has to decide here whether it sells.
 */
function isSellable(type: OfferType): boolean {
  switch (type) {
    case 'centrifuge::vault':
    case 'ondo::swap':
      return true;
    case 'coinlist::token_sale':
    case 'superstate::swap':
      return false;
  }
}
