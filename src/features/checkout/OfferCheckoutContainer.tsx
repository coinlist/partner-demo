'use client';

import type { OfferDetail } from '@coinlist-co/react/shared';
import { OfferCheckoutView } from '@/features/checkout/OfferCheckoutView';
import { useOfferCheckoutViewModel } from '@/features/checkout/useOfferCheckoutViewModel';

interface Props {
  offerDetail: OfferDetail;
  onBack: () => void;
}

export function OfferCheckoutContainer({ offerDetail, onBack }: Props) {
  const { state, onEvent } = useOfferCheckoutViewModel({ offerDetail, onBack });
  return <OfferCheckoutView state={state} onEvent={onEvent} />;
}
