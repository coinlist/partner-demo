'use client';

import {
  type LoadOfferDetailsState,
  useOfferDetails,
} from '@coinlist-co/react';
import {
  type OfferDetail,
  OfferId,
  type OfferOptionId,
} from '@coinlist-co/react/universal';
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
      logoUrl: string | null;
      about: string | null;
      links: OfferUiLink[];
      terms: OfferUiTerm[];
      milestones: OfferUiMilestone[];
      faqs: OfferUiFaq[];
      isTokenSale: boolean;
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
      type: 'ON_CHECKOUT_BACK';
    };

/**
 * Whether the checkout has taken over the page, and the offer it is buying.
 *
 * A union rather than `{ active: boolean; offerDetail: OfferDetail | null }`,
 * so "open with nothing to buy" cannot be built: the checkout can only open
 * once the offer has loaded.
 */
export type OfferCheckoutState =
  | { type: 'CLOSED' }
  | { type: 'OPEN'; offerDetail: OfferDetail };

export function useOfferViewModel(): {
  state: OfferUiState;
  onEvent: (event: OfferUiEvent) => void;
  checkout: OfferCheckoutState;
} {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const [selectedOptionId, setSelectedOptionId] =
    useState<OfferOptionId | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const offerId = parseRouteOfferId(params.id) ?? OfferId('');
  const { offerDetailsState } = useOfferDetails(offerId);

  const state: OfferUiState = mapOfferUiState(
    offerId,
    offerDetailsState,
    selectedOptionId
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
      case 'ON_INVEST_CLICK': {
        // Nothing to invest in until the detail loads, and the button is only
        // reachable from the loaded view anyway.
        if (!offerDetail) break;

        // Where each kind of offer is bought. Matched rather than tested for
        // "not a token sale", so a new offer type CoinList adds is a compile
        // error here instead of silently opening a checkout the SDK may not
        // serve yet.
        switch (offerDetail.type) {
          case 'coinlist::token_sale': {
            // The SDK ships no token-sale flow yet; the demo's own lives at
            // /offer/[id]/invest.
            const resolvedOptionId =
              selectedOptionId ?? offerDetail.options[0]?.id ?? null;
            if (resolvedOptionId) {
              router.push(ROUTES.OFFER_INVEST(offerId, resolvedOptionId));
            }
            break;
          }
          case 'superstate::swap':
          case 'ondo::swap':
            // Both are swaps the SDK's CheckoutContainer handles in-page, so
            // it does not matter which provider the offer belongs to.
            setCheckoutOpen(true);
            break;
          default: {
            const exhaustive: never = offerDetail.type;
            return exhaustive;
          }
        }
        break;
      }
      case 'ON_CHECKOUT_BACK':
        setCheckoutOpen(false);
        break;
    }
  };

  return {
    state,
    onEvent,
    checkout:
      checkoutOpen && offerDetail
        ? { type: 'OPEN', offerDetail }
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

function mapOfferUiState(
  routeOfferId: string | null,
  offerDetailsState: LoadOfferDetailsState,
  selectedOptionId: OfferOptionId | null
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
      const options = offerDetail.options.map((opt) => ({
        id: opt.id,
        slug: opt.slug.toString(),
      }));
      const resolvedOptionId = selectedOptionId ?? options[0]?.id ?? null;
      return {
        type: 'CONTENT',
        offerId: OfferId(routeOfferId),
        options,
        selectedOptionId: resolvedOptionId,
        name: offerDetail.name,
        symbol: offerDetail.asset.code.toString(),
        tagline: offerDetail.tagline,
        logoUrl: offerDetail.logoUrl || null,
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
      };
    }
  }
}
