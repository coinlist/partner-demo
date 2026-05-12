'use client';

import { OfferView } from '@/features/offer/OfferView';
import { useOfferViewModel } from '@/features/offer/useOfferViewModel';

export function OfferContainer() {
  const { state, onEvent } = useOfferViewModel();
  return <OfferView state={state} onEvent={onEvent} />;
}
