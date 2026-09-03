'use client';

import {
  type LoadOfferDetailsState,
  type LoadParticipationsState,
  useOfferDetails,
  useParticipations,
} from '@coinlist-co/react';
import {
  type OfferDetail,
  OfferId,
  type OfferOptionId,
  type OfferType,
  type OrderBookSide,
  type ParticipationStatus,
} from '@coinlist-co/react/shared';
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
  priceUsd: string | null;
};

export type ParticipationUi = {
  id: string;
  displayAmount: string;
  assetCode: string;
  status: ParticipationStatus;
  chain: string;
  walletAddress: string | null;
  insertedAt: Date | null;
};

export type ParticipationsUiState =
  | { type: 'LOADING' }
  | { type: 'ERROR' }
  | { type: 'CONTENT'; participations: ParticipationUi[] };

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
      statusText: string;
      tagline: string | null;
      bannerUrl: string | null;
      logoUrl: string | null;
      about: string | null;
      startsAt: Date;
      endsAt: Date | null;
      links: OfferUiLink[];
      terms: OfferUiTerm[];
      milestones: OfferUiMilestone[];
      faqs: OfferUiFaq[];
      tokenCode: string;
      tokenPriceUsd: string | null;
      participationsState: ParticipationsUiState;
      showParticipations: boolean;
      /**
       * Whether the sidebar offers a "Sell" button. Ondo is the only provider
       * whose offers can be sold today, and the only checkout the SDK serves
       * both directions of.
       *
       * Decided here rather than by handing the View the offer type, so the
       * View renders what it is given instead of interpreting the domain.
       */
      showSell: boolean;
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
 * Whether the checkout has taken over the page, the offer it is trading and
 * which way round.
 *
 * A union rather than `{ active: boolean; offerDetail: OfferDetail | null }`,
 * so "open with nothing to trade" cannot be built: the checkout can only open
 * once the offer has loaded. `side` rides along for the same reason - an open
 * checkout always has a direction, and the SDK reads it once at mount.
 */
export type OfferCheckoutState =
  | { type: 'CLOSED' }
  | { type: 'OPEN'; offerDetail: OfferDetail; side: OrderBookSide };

export function useOfferViewModel(): {
  state: OfferUiState;
  onEvent: (event: OfferUiEvent) => void;
  checkout: OfferCheckoutState;
} {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const [selectedOptionId, setSelectedOptionId] =
    useState<OfferOptionId | null>(null);
  // The direction the open checkout is running, or `null` when it is closed.
  // One piece of state rather than a boolean beside a side, so "open with no
  // direction" is unrepresentable.
  const [checkoutSide, setCheckoutSide] = useState<OrderBookSide | null>(null);

  const offerId = parseRouteOfferId(params.id) ?? OfferId('');
  const { offerDetailsState } = useOfferDetails(offerId);
  // Only token sales surface participations, but the offer type isn't known
  // until the detail loads, so we always fetch here; the panel stays hidden for
  // swap offers (see `showParticipations`), and the result is simply unused.
  const { participationsState } = useParticipations(offerId);

  const state: OfferUiState = mapOfferUiState(
    offerId,
    offerDetailsState,
    selectedOptionId,
    participationsState
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
            setCheckoutSide('buy');
            break;
          default: {
            const exhaustive: never = offerDetail.type;
            return exhaustive;
          }
        }
        break;
      }
      case 'ON_SELL_CLICK':
        // Reachable only from an Ondo offer's sidebar (`showSell`), and only
        // once the detail has loaded - the same guard the buy path makes.
        // Deliberately not routed through the requirements checklist: selling
        // liquidates a holding the user already has.
        if (!offerDetail) break;

        setCheckoutSide('sell');
        break;
      case 'ON_CHECKOUT_BACK':
        setCheckoutSide(null);
        break;
    }
  };

  return {
    state,
    onEvent,
    checkout:
      checkoutSide && offerDetail
        ? { type: 'OPEN', offerDetail, side: checkoutSide }
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
  selectedOptionId: OfferOptionId | null,
  loadParticipationsState: LoadParticipationsState
): OfferUiState {
  const participationsState: ParticipationsUiState =
    loadParticipationsState.type === 'CONTENT'
      ? {
          type: 'CONTENT',
          participations: loadParticipationsState.participations.map((p) => ({
            id: p.id.toString(),
            displayAmount: p.displayAmount,
            assetCode: p.asset.code.toString(),
            status: p.status,
            chain: p.chain.toString(),
            walletAddress: p.walletAddress?.toString() ?? null,
            insertedAt: p.insertedAt,
          })),
        }
      : { type: loadParticipationsState.type };
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
      const isTokenSale = offerDetail.type === 'coinlist::token_sale';
      const isOndoSwap = offerDetail.type === 'ondo::swap';
      const options = offerDetail.options.map((opt) => ({
        id: opt.id,
        slug: opt.slug.toString(),
        priceUsd: opt.priceUsd,
      }));
      const resolvedOptionId = selectedOptionId ?? options[0]?.id ?? null;
      const selectedOption = options.find((opt) => opt.id === resolvedOptionId);
      return {
        type: 'CONTENT',
        offerId: OfferId(routeOfferId),
        options,
        selectedOptionId: resolvedOptionId,
        name: offerDetail.name,
        statusText: offerStatusText(offerDetail.type),
        tagline: offerDetail.tagline,
        bannerUrl: offerDetail.bannerUrl,
        logoUrl: offerDetail.logoUrl,
        about: offerDetail.about,
        startsAt: offerDetail.startsAt,
        endsAt: offerDetail.endsAt,
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
        tokenCode: offerDetail.asset.code,
        tokenPriceUsd: selectedOption?.priceUsd ?? null,
        participationsState,
        // Participations are a token-sale concept: a swap settles on-chain in
        // one transaction, so there is nothing for CoinList to record.
        showParticipations: isTokenSale,
        // Superstate's checkout is buy-only and a token sale has no sell side
        // at all, so Ondo is the only offer that gets the button.
        showSell: isOndoSwap,
      };
    }
  }
}

/**
 * What the sidebar calls this kind of offer.
 *
 * An exhaustive switch rather than a token-sale/other ternary, so a new offer
 * type CoinList adds is a compile error here instead of quietly labelling
 * itself as something it is not.
 */
function offerStatusText(type: OfferType): string {
  switch (type) {
    case 'coinlist::token_sale':
      return 'Token Sale';
    case 'superstate::swap':
      return 'Superstate Swap';
    case 'ondo::swap':
      return 'Ondo Swap';
    default: {
      const exhaustive: never = type;
      return exhaustive;
    }
  }
}
