'use client';

import {
  type LoadOfferDetailsState,
  OfferLogoUi,
  PortfolioOfferDetailsUi,
  useOfferDetails,
  usePassage,
  useTokenRegistry,
} from '@passage-cl/react';
import {
  AsyncOfferDetail,
  type OfferDetail,
  OfferId,
  type OfferOptionId,
  type OrderBookSide,
  type SignInMethod,
  TokenRegistrySnapshot,
} from '@passage-cl/react/universal';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
      offerDetail: OfferDetail;
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
       * The portfolio column, when this offer is an Ondo portfolio. Null for
       * every other offer type, which keeps the sale layout.
       */
      portfolio: PortfolioOfferDetailsUi | null;
      /** The side last continued with, so Back from checkout keeps it. */
      lastSide: OrderBookSide;
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
      type: 'ON_CONTINUE';
      side: OrderBookSide;
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
       * it with the order. An offer with no options has nothing to order, so
       * the checkout stays closed.
       */
      optionId: OfferOptionId;
    };

/** The sign-in each option takes, for a visitor with no CoinList account. */
export type SignInByOption = Partial<
  Record<OfferOptionId, SignInMethod['method']>
>;

export function useOfferViewModel(seededOfferDetail?: OfferDetail): {
  state: OfferUiState;
  onEvent: (event: OfferUiEvent) => void;
  checkout: OfferCheckoutState;
} {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const [selectedOptionId, setSelectedOptionId] =
    useState<OfferOptionId | null>(null);
  const [lastSide, setLastSide] = useState<OrderBookSide>('buy');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { authState } = usePassage();
  // A wallet session that ends mid-checkout leaves nothing to order with, so
  // the visitor is back on the offer, to connect and sign in again. Signed
  // out, the page opens no checkout.
  useEffect(() => {
    if (authState.type === 'logged-out') setCheckoutOpen(false);
  }, [authState.type]);

  const offerId = parseRouteOfferId(params.id) ?? OfferId('');
  const { offerDetailsState } = useOfferDetails(offerId, {
    data: seededOfferDetail,
  });
  // Fetched here rather than seeded: the registry is public, so the browser
  // can read it directly.
  const { state: registryState } = useTokenRegistry();
  const registry =
    registryState.type === 'CONTENT' ? registryState.registry : null;

  const state: OfferUiState = mapOfferUiState(
    offerId,
    offerDetailsState,
    selectedOptionId,
    lastSide,
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
      case 'ON_CONTINUE':
        // The SDK's CheckoutContainer runs every offer type in-page, token
        // sales included, so it does not matter which provider this is.
        setLastSide(event.side);
        setCheckoutOpen(true);
        break;
      case 'ON_CHECKOUT_BACK':
        setCheckoutOpen(false);
        break;
    }
  };

  return {
    state,
    onEvent,
    checkout: mapCheckoutState(
      checkoutOpen,
      lastSide,
      offerDetail,
      selectedOptionId
    ),
  };
}

/**
 * The page offers Buy and Sell only once an option is resolved, so an offer
 * with no options never opens the checkout: the SDK requires an option.
 */
function mapCheckoutState(
  checkoutOpen: boolean,
  side: OrderBookSide,
  offerDetail: OfferDetail | null,
  selectedOptionId: OfferOptionId | null
): OfferCheckoutState {
  if (!checkoutOpen || !offerDetail) return { type: 'CLOSED' };
  const optionId = resolveOptionId(selectedOptionId, offerDetail.options);
  return optionId
    ? { type: 'OPEN', offerDetail, optionId, side }
    : { type: 'CLOSED' };
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
  lastSide: OrderBookSide,
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
      // Ondo swaps, Ondo portfolios and Centrifuge vaults omit OfferEditorial
      // (no campaign copy).
      const tagline =
        offerDetail.type === 'ondo::swap' ||
        offerDetail.type === 'ondo::portfolio' ||
        offerDetail.type === 'centrifuge::vault'
          ? null
          : offerDetail.tagline;
      const options = offerDetail.options.map((opt) => ({
        id: opt.id,
        slug: opt.slug.toString(),
      }));
      const tokenMetadata = registry
        ? TokenRegistrySnapshot.forOffer(registry, offerDetail)
        : null;
      return {
        type: 'CONTENT',
        offerDetail,
        options,
        selectedOptionId: resolveOptionId(
          selectedOptionId,
          offerDetail.options
        ),
        name: offerDetail.name,
        symbol: offerDetail.asset.code.toString(),
        tagline,
        logo: OfferLogoUi.fromOffer(offerDetail, tokenMetadata),
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
        lastSide,
        claimableOffer: AsyncOfferDetail.is(offerDetail) ? offerDetail : null,
        // The demo does not set a locale; en-US is the SDK default.
        portfolio:
          offerDetail.type === 'ondo::portfolio'
            ? PortfolioOfferDetailsUi.fromDetail(
                offerDetail,
                'en-US',
                tokenMetadata
              )
            : null,
      };
    }
  }
}
