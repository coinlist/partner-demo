"use client";

import {
  OfferDetail,
  OfferId,
  OfferOptionId,
  Participation,
  Requirement,
  RequirementStatusInfo,
} from "@coinlist-co/react";
import { OfferView } from "./OfferView";
import { useOfferViewModel } from "./useOfferViewModel";

export interface Props {
  offerId: OfferId;
  preloadData: OfferDetailPreloadData | null;
}

export type OfferDetailPreloadData = {
  offerDetail: OfferDetail;
  requirements: Record<OfferOptionId, Requirement[]>;
  requirementStatuses: RequirementStatusInfo[];
  participations: Participation[];
};

export function OfferContainer({ offerId, preloadData }: Props) {
  const { state, onEvent } = useOfferViewModel(offerId, preloadData);
  return <OfferView state={state} onEvent={onEvent} />;
}
