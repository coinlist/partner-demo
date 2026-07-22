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
  type ParticipationStatus,
} from '@coinlist-co/react/shared';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { isSwapOffer } from '@/features/swap/constants';
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
      tagline: string | null;
      bannerUrl: string | null;
      logoUrl: string | null;
      about: string | null;
      startsAt: Date;
      endsAt: Date;
      links: OfferUiLink[];
      terms: OfferUiTerm[];
      milestones: OfferUiMilestone[];
      faqs: OfferUiFaq[];
      tokenCode: string;
      tokenPriceUsd: string | null;
      participationsState: ParticipationsUiState;
      showParticipations: boolean;
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
      type: 'ON_SWAP_BACK';
    };

export type OfferSwapState = {
  active: boolean;
  offerDetail: OfferDetail | null;
};

export function useOfferViewModel(): {
  state: OfferUiState;
  onEvent: (event: OfferUiEvent) => void;
  swap: OfferSwapState;
} {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const [selectedOptionId, setSelectedOptionId] =
    useState<OfferOptionId | null>(null);
  const [showSwap, setShowSwap] = useState(false);

  const offerId = parseRouteOfferId(params.id) ?? OfferId('');
  const { offerDetailsState } = useOfferDetails(offerId);
  // Swap offers never surface participations, so skip the fetch entirely by
  // seeding the hook with empty pre-fetched data.
  const { participationsState } = useParticipations(
    offerId,
    isSwapOffer(offerId) ? { data: [] } : undefined
  );

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
        // Swap offers open the in-page swap flow; all others route to the
        // standard participation flow.
        if (isSwapOffer(offerId)) {
          setShowSwap(true);
          break;
        }
        const resolvedOptionId =
          selectedOptionId ?? offerDetail?.options[0]?.id ?? null;
        if (resolvedOptionId) {
          router.push(ROUTES.OFFER_INVEST(offerId, resolvedOptionId));
        }
        break;
      }
      case 'ON_SWAP_BACK':
        setShowSwap(false);
        break;
    }
  };

  return {
    state,
    onEvent,
    swap: {
      active: showSwap && offerDetail !== null,
      offerDetail,
    },
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
      const options = offerDetailsState.offerDetail.options.map((opt) => ({
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
        name: offerDetailsState.offerDetail.name,
        tagline: offerDetailsState.offerDetail.tagline,
        bannerUrl: offerDetailsState.offerDetail.bannerUrl,
        logoUrl: offerDetailsState.offerDetail.logoUrl,
        about: offerDetailsState.offerDetail.about,
        startsAt: offerDetailsState.offerDetail.startsAt,
        endsAt: offerDetailsState.offerDetail.endsAt,
        links: offerDetailsState.offerDetail.links
          .filter((link) => Boolean(link.label && link.url))
          .map((link) => ({
            label: link.label ?? '',
            url: link.url ?? '',
          })),
        terms: offerDetailsState.offerDetail.terms
          .filter((term) => Boolean(term.key && term.value))
          .map((term) => ({
            key: term.key ?? '',
            value: term.value ?? '',
          })),
        milestones: offerDetailsState.offerDetail.milestones
          .filter((milestone) => Boolean(milestone.name && milestone.schedule))
          .map((milestone) => ({
            name: milestone.name ?? '',
            schedule: milestone.schedule ?? '',
            status: milestone.status,
          })),
        faqs: offerDetailsState.offerDetail.faqs
          .filter((faq) => Boolean(faq.question && faq.answer))
          .map((faq) => ({
            question: faq.question ?? '',
            answer: faq.answer ?? '',
          })),
        tokenCode: offerDetailsState.offerDetail.asset.code,
        tokenPriceUsd: selectedOption?.priceUsd ?? null,
        participationsState,
        // Swap offers use the in-page swap flow and do not surface
        // participations, so the panel is hidden for them.
        showParticipations: !isSwapOffer(OfferId(routeOfferId)),
      };
    }
  }
}
