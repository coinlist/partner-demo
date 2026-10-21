'use client';

import type {
  CoinListTokenSaleOfferDetail,
  OfferOption,
} from '@coinlist-co/react/universal';
import { InvestView } from '@/features/invest/InvestView';
import { useInvestViewModel } from '@/features/invest/useInvestViewModel';

interface Props {
  offerDetail: CoinListTokenSaleOfferDetail;
  option: OfferOption;
}

export function InvestContainer({ offerDetail, option }: Props) {
  const { state, onEvent } = useInvestViewModel(offerDetail, option);
  return <InvestView state={state} onEvent={onEvent} />;
}
