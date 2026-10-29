'use client';

import type { OfferDetail } from '@passage-cl/react/universal';
import { OfferCheckoutContainer } from '@/features/checkout/OfferCheckoutContainer';
import { OfferView } from '@/features/offer/OfferView';
import { useOfferViewModel } from '@/features/offer/useOfferViewModel';

export interface Props {
  /** The offer pre-fetched on the server, for a visitor with no CoinList user. */
  offerDetail?: OfferDetail;
}

export function OfferContainer({ offerDetail }: Props) {
  const { state, onEvent, checkout } = useOfferViewModel(offerDetail);

  // The checkout takes over the whole page rather than rendering beside the
  // offer, and unmounting the offer view is what stops its requests while it
  // is off screen.
  if (checkout.type === 'OPEN') {
    return (
      <OfferCheckoutContainer
        offerDetail={checkout.offerDetail}
        optionId={checkout.optionId}
        side={checkout.side}
        onBack={() => onEvent({ type: 'ON_CHECKOUT_BACK' })}
      />
    );
  }

  return <OfferView state={state} onEvent={onEvent} />;
}
