'use client';

import { OfferView } from '@/features/offer/OfferView';
import { useOfferViewModel } from '@/features/offer/useOfferViewModel';
import { SwapContainer } from '@/features/swap/SwapContainer';

export function OfferContainer() {
  const { state, onEvent, swap } = useOfferViewModel();

  if (swap.active && swap.offerDetail) {
    return (
      <SwapContainer
        offerDetail={swap.offerDetail}
        onBack={() => onEvent({ type: 'ON_SWAP_BACK' })}
      />
    );
  }

  return <OfferView state={state} onEvent={onEvent} />;
}
