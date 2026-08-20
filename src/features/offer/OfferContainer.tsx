'use client';

import { OfferCheckoutContainer } from '@/features/checkout/OfferCheckoutContainer';
import { OfferView } from '@/features/offer/OfferView';
import { useOfferViewModel } from '@/features/offer/useOfferViewModel';

export function OfferContainer() {
  const { state, onEvent, checkout } = useOfferViewModel();

  // The checkout takes over the whole page rather than rendering beside the
  // offer, and unmounting the offer view is what stops its requests while it
  // is off screen.
  if (checkout.type === 'OPEN') {
    return (
      <OfferCheckoutContainer
        offerDetail={checkout.offerDetail}
        onBack={() => onEvent({ type: 'ON_CHECKOUT_BACK' })}
      />
    );
  }

  return <OfferView state={state} onEvent={onEvent} />;
}
