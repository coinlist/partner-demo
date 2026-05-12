'use client';

import type { OfferDetail, OfferOption } from '@coinlist-co/react/shared';
import { InvestView } from '@/features/invest/InvestView';
import { useInvestViewModel } from '@/features/invest/useInvestViewModel';

interface Props {
  offerDetail: OfferDetail;
  option: OfferOption;
}

export function InvestContainer({ offerDetail, option }: Props) {
  const { state, onEvent } = useInvestViewModel(offerDetail, option);
  return <InvestView state={state} onEvent={onEvent} />;
}
