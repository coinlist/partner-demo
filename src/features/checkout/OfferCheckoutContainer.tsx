'use client';

import type { OfferDetail, OrderBookSide } from '@coinlist-co/react/shared';
import { OfferCheckoutView } from '@/features/checkout/OfferCheckoutView';
import { useOfferCheckoutViewModel } from '@/features/checkout/useOfferCheckoutViewModel';

interface Props {
  offerDetail: OfferDetail;
  /** Which way the trade runs. Fixed for as long as this stays mounted. */
  side: OrderBookSide;
  onBack: () => void;
}

export function OfferCheckoutContainer({ offerDetail, side, onBack }: Props) {
  const { state, onEvent } = useOfferCheckoutViewModel({
    offerDetail,
    side,
    onBack,
  });
  return <OfferCheckoutView state={state} onEvent={onEvent} />;
}
