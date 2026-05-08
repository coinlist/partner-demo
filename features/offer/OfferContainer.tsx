'use client';

import { OfferView } from './OfferView';
import { useOfferViewModel } from './useOfferViewModel';

export function OfferContainer() {
  const { state, onEvent } = useOfferViewModel();
  return <OfferView state={state} onEvent={onEvent} />;
}
