'use client';

import {
  OfferAssetCard,
  OfferAssetCardUi,
  useOfferDetails,
} from '@coinlist-co/react';
import type { Offer, TokenMetadata } from '@coinlist-co/react/universal';

/**
 * Ondo browse rows need name + symbol for {@link OfferAssetCard}. The Nabu
 * token registry (`tokenMetadata`) is the source of name, ticker and logo;
 * only when it does not list the token is the offer detail loaded to fill
 * them in, since the list payload carries neither.
 */
export function OndoOfferAssetCard({
  offer,
  tokenMetadata,
  onClick,
}: {
  offer: Offer;
  tokenMetadata: TokenMetadata | null;
  onClick: () => void;
}) {
  const { offerDetailsState } = useOfferDetails(offer.id, {
    enabled: tokenMetadata === null,
  });

  const cardUi =
    offerDetailsState.type === 'CONTENT'
      ? OfferAssetCardUi.fromDetail(
          offerDetailsState.offerDetail,
          tokenMetadata
        )
      : OfferAssetCardUi.fromOffer(offer, tokenMetadata);

  return <OfferAssetCard offer={cardUi} onClick={onClick} />;
}
