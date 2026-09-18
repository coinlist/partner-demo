'use client';

import {
  OfferAssetCard,
  OfferAssetCardUi,
  useOfferDetails,
} from '@coinlist-co/react';
import type { Offer } from '@coinlist-co/react/universal';

/**
 * Ondo browse rows need name + symbol for {@link OfferAssetCard}. The list
 * payload has neither, so load detail and map with `fromDetail`. Logo comes
 * from the offer catalogue (`logoUrl`) the same way the SDK mapper intends.
 */
export function OndoOfferAssetCard({
  offer,
  onClick,
}: {
  offer: Offer;
  onClick: () => void;
}) {
  const { offerDetailsState } = useOfferDetails(offer.id);

  const cardUi =
    offerDetailsState.type === 'CONTENT'
      ? OfferAssetCardUi.fromDetail(offerDetailsState.offerDetail)
      : OfferAssetCardUi.fromOffer(offer);

  return <OfferAssetCard offer={cardUi} onClick={onClick} />;
}
