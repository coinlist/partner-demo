'use client';

import {
  OfferAssetCard,
  OfferAssetCardUi,
  useOfferDetails,
} from '@coinlist-co/react';
import type { Offer } from '@coinlist-co/react/universal';
import type { TokenDisplay } from '@/lib/token-display.server';

/**
 * Ondo browse rows need name + symbol for {@link OfferAssetCard}. The list
 * payload has neither. The Nabu token registry (`display`) is the source of
 * name, ticker and logo, as on frontline-web; the offer detail fills in when
 * the registry does not list the token.
 */
export function OndoOfferAssetCard({
  offer,
  display,
  onClick,
}: {
  offer: Offer;
  display: TokenDisplay | null;
  onClick: () => void;
}) {
  const { offerDetailsState } = useOfferDetails(offer.id);

  const cardUi =
    offerDetailsState.type === 'CONTENT'
      ? OfferAssetCardUi.fromDetail(offerDetailsState.offerDetail)
      : OfferAssetCardUi.fromOffer(offer);

  return (
    <OfferAssetCard
      offer={
        display
          ? {
              ...cardUi,
              name: display.name,
              symbol: display.code,
              logoUrl: display.logoUrl,
            }
          : cardUi
      }
      onClick={onClick}
    />
  );
}
