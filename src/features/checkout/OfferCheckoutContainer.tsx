'use client';

import type {
  OfferDetail,
  OfferOptionId,
  OrderBookSide,
} from '@passage-cl/react/universal';
import { OfferCheckoutView } from '@/features/checkout/OfferCheckoutView';
import { useOfferCheckoutViewModel } from '@/features/checkout/useOfferCheckoutViewModel';

interface Props {
  offerDetail: OfferDetail;
  optionId: OfferOptionId;
  side: OrderBookSide;
  onBack: () => void;
}

export function OfferCheckoutContainer({
  offerDetail,
  optionId,
  side,
  onBack,
}: Props) {
  const { state } = useOfferCheckoutViewModel({ offerDetail, optionId, side });
  return <OfferCheckoutView state={state} onBack={onBack} />;
}
