"use client";

import { ROUTES } from "@/lib/routes";
import {
  OfferDetailFaqItem,
  OfferDetailLink,
  OfferDetailMilestone,
  OfferDetailTerm,
} from "@coinlist-co/react/client/components";
import { OfferId } from "@coinlist-co/react/client";
import { useCoinListOfferDetails } from "@coinlist-co/react/client/hooks";
import { useParams, useRouter } from "next/navigation";

export type OfferUiState =
  | { type: "LOADING" }
  | { type: "ERROR"; message: string; isAuthError: boolean }
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
      links: OfferDetailLink[];
      terms: OfferDetailTerm[];
      milestones: OfferDetailMilestone[];
      faqs: OfferDetailFaqItem[];
      tokenCode: string;
      tokenPriceUsd: number | null;
    };

export type OfferUiEvent =
  | { type: "ON_BACK_CLICK" }
  | { type: "ON_RETRY_CLICK" };

export function useOfferViewModel(): {
  state: OfferUiState;
  onEvent: (event: OfferUiEvent) => void;
} {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();

  const routeOfferId = parseRouteOfferId(params.id);
  const { offerDetailsState } = useCoinListOfferDetails(
    OfferId(routeOfferId ?? ""),
  );

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

  return { state, onEvent };
}

function parseRouteOfferId(id: string | string[] | undefined): string | null {
  if (!id) return null;
  if (Array.isArray(id)) return id[0] ?? null;
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
      return { type: "LOADING" };
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
      const { offerDetail } = offerDetailsState;
      return {
        type: "CONTENT",
        offerId: routeOfferId,
        name: offerDetail.name,
        tagline: offerDetail.tagline,
        bannerUrl: offerDetail.bannerUrl,
        logoUrl: offerDetail.logoUrl,
        about: offerDetail.about,
        startsAt: offerDetail.startsAt,
        endsAt: offerDetail.endsAt,
        links: offerDetail.links.flatMap((l) => {
          const ui = OfferDetailLink.fromDomain(l);
          return ui ? [ui] : [];
        }),
        terms: offerDetail.terms.flatMap((t) => {
          const ui = OfferDetailTerm.fromDomain(t);
          return ui ? [ui] : [];
        }),
        milestones: offerDetail.milestones.flatMap((m) => {
          const ui = OfferDetailMilestone.fromDomain(m);
          return ui ? [ui] : [];
        }),
        faqs: offerDetail.faqs.flatMap((f) => {
          const ui = OfferDetailFaqItem.fromDomain(f);
          return ui ? [ui] : [];
        }),
        tokenCode: offerDetail.asset.code,
        tokenPriceUsd: offerDetail.options[0]?.priceUsd ?? null,
      };
    }
  }
}
