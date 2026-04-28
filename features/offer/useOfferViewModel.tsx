"use client";

import { ROUTES } from "@/lib/routes";
import {
  OfferId,
  OfferOptionId,
  type Participation,
  type ParticipationStatus,
} from "@coinlist-co/react/client";
import {
  LoadOfferDetailsState,
  useCoinList,
  useCoinListOfferDetails,
} from "@coinlist-co/react/client/hooks";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  status: "completed" | "active" | "upcoming";
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
  | { type: "LOADING" }
  | { type: "ERROR" }
  | { type: "CONTENT"; participations: ParticipationUi[] };

export type OfferUiState =
  | {
      type: "LOADING";
    }
  | {
      type: "ERROR";
      message: string;
      isAuthError: boolean;
    }
  | {
      type: "CONTENT";
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
    };

export type OfferUiEvent =
  | {
      type: "ON_BACK_CLICK";
    }
  | {
      type: "ON_RETRY_CLICK";
    }
  | {
      type: "ON_OPTION_SELECT";
      optionId: OfferOptionId;
    };

export function useOfferViewModel(): {
  state: OfferUiState;
  onEvent: (event: OfferUiEvent) => void;
} {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const [selectedOptionId, setSelectedOptionId] =
    useState<OfferOptionId | null>(null);

  const routeOfferId = parseRouteOfferId(params.id);
  const { offerDetailsState } = useCoinListOfferDetails(
    OfferId(routeOfferId ?? ""),
  );

  const { isReady, coinlist } = useCoinList();
  const [participationsState, setParticipationsState] =
    useState<ParticipationsUiState>({ type: "LOADING" });

  useEffect(() => {
    if (!isReady || !routeOfferId) return;
    setParticipationsState({ type: "LOADING" });
    coinlist
      .fetchAllParticipations(OfferId(routeOfferId))
      .then((participations) =>
        setParticipationsState({
          type: "CONTENT",
          participations: participations.map(mapParticipation),
        }),
      )
      .catch(() => setParticipationsState({ type: "ERROR" }));
  }, [isReady, coinlist, routeOfferId]);

  const state: OfferUiState = mapOfferUiState(
    routeOfferId,
    offerDetailsState,
    selectedOptionId,
    participationsState,
  );

  const onEvent = (event: OfferUiEvent) => {
    switch (event.type) {
      case "ON_BACK_CLICK":
        router.push(ROUTES.ROOT);
        break;
      case "ON_RETRY_CLICK":
        router.refresh();
        break;
      case "ON_OPTION_SELECT":
        setSelectedOptionId(event.optionId);
        break;
    }
  };

  return {
    state,
    onEvent,
  };
}

function parseRouteOfferId(id: string | string[] | undefined): string | null {
  if (!id) {
    return null;
  }

  if (Array.isArray(id)) {
    return id[0] ?? null;
  }

  return id;
}

function mapParticipation(p: Participation): ParticipationUi {
  return {
    id: p.id.toString(),
    displayAmount: p.displayAmount,
    assetCode: p.asset.code.toString(),
    status: p.status,
    chain: p.chain.toString(),
    walletAddress: p.walletAddress?.toString() ?? null,
    insertedAt: p.insertedAt,
  };
}

function mapOfferUiState(
  routeOfferId: string | null,
  offerDetailsState: LoadOfferDetailsState,
  selectedOptionId: OfferOptionId | null,
  participationsState: ParticipationsUiState,
): OfferUiState {
  if (!routeOfferId) {
    return {
      type: "ERROR",
      message: "Offer ID is missing in the URL.",
      isAuthError: false,
    };
  }

  switch (offerDetailsState.type) {
    case "LOADING":
      return {
        type: "LOADING",
      };
    case "ERROR":
      return {
        type: "ERROR",
        message:
          offerDetailsState.reason === "not-authenticated"
            ? "Your session expired. Please sign in again."
            : "Could not load offer details. Please try again.",
        isAuthError: offerDetailsState.reason === "not-authenticated",
      };
    case "CONTENT": {
      const options = offerDetailsState.offerDetail.options.map((opt) => ({
        id: opt.id,
        slug: opt.slug.toString(),
        priceUsd: opt.priceUsd,
      }));
      const resolvedOptionId = selectedOptionId ?? options[0]?.id ?? null;
      const selectedOption = options.find((opt) => opt.id === resolvedOptionId);
      return {
        type: "CONTENT",
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
            label: link.label ?? "",
            url: link.url ?? "",
          })),
        terms: offerDetailsState.offerDetail.terms
          .filter((term) => Boolean(term.key && term.value))
          .map((term) => ({
            key: term.key ?? "",
            value: term.value ?? "",
          })),
        milestones: offerDetailsState.offerDetail.milestones
          .filter((milestone) => Boolean(milestone.name && milestone.schedule))
          .map((milestone) => ({
            name: milestone.name ?? "",
            schedule: milestone.schedule ?? "",
            status: milestone.status,
          })),
        faqs: offerDetailsState.offerDetail.faqs
          .filter((faq) => Boolean(faq.question && faq.answer))
          .map((faq) => ({
            question: faq.question ?? "",
            answer: faq.answer ?? "",
          })),
        tokenCode: offerDetailsState.offerDetail.asset.code,
        tokenPriceUsd: selectedOption?.priceUsd ?? null,
        participationsState,
      };
    }
  }
}
