'use client';

import { OfferCheckoutContainer } from '@/features/checkout/OfferCheckoutContainer';
import { OfferView } from '@/features/offer/OfferView';
import { useOfferViewModel } from '@/features/offer/useOfferViewModel';
import type { TokenDisplay } from '@/lib/token-display.server';

export function OfferContainer({
  tokenDisplay,
}: {
  /** The token's Nabu registry display; `null` when the registry lists none. */
  tokenDisplay: TokenDisplay | null;
}) {
  const { state, onEvent, checkout } = useOfferViewModel(tokenDisplay);

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
