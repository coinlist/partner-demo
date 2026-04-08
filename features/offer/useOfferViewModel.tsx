"use client";

import { ROUTES } from "@/lib/routes";
import { OfferId } from "@coinlist-co/react/client";
import { useCoinListOfferDetails } from "@coinlist-co/react/client/hooks";
import { useParams, useRouter } from "next/navigation";

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
      offerId: string;
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
      tokenPriceUsd: number | null;
    };

export type OfferUiEvent =
  | {
      type: "ON_BACK_CLICK";
    }
  | {
      type: "ON_RETRY_CLICK";
    };

export function useOfferViewModel(): {
  state: OfferUiState;
  onEvent: (event: OfferUiEvent) => void;
} {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();

  const routeOfferId = parseRouteOfferId(params.id);
  const { offerDetailsState } = useCoinListOfferDetails(OfferId(routeOfferId ?? ""));

  const state: OfferUiState = mapOfferUiState(routeOfferId, offerDetailsState);

  const onEvent = (event: OfferUiEvent) => {
    switch (event.type) {
      case "ON_BACK_CLICK":
        router.push(ROUTES.ROOT);
        break;
      case "ON_RETRY_CLICK":
        router.refresh();
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

function mapOfferUiState(
  routeOfferId: string | null,
  offerDetailsState: ReturnType<typeof useCoinListOfferDetails>["offerDetailsState"],
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
    case "CONTENT":
      return {
        type: "CONTENT",
        offerId: routeOfferId,
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
        tokenPriceUsd: offerDetailsState.offerDetail.options[0]?.priceUsd ?? null,
      };
  }
}
