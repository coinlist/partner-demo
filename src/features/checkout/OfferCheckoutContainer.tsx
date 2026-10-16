'use client';

import type { OfferDetail, OfferOptionId } from '@coinlist-co/react/universal';
import { OfferCheckoutView } from '@/features/checkout/OfferCheckoutView';
import { useOfferCheckoutViewModel } from '@/features/checkout/useOfferCheckoutViewModel';

interface Props {
  offerDetail: OfferDetail;
  optionId: OfferOptionId | null;
  onBack: () => void;
}

export function OfferCheckoutContainer({
  offerDetail,
  optionId,
  onBack,
}: Props) {
  const { state } = useOfferCheckoutViewModel({ offerDetail, optionId });
  return <OfferCheckoutView state={state} onBack={onBack} />;
}
