'use client';

import type { OfferDetail } from '@coinlist-co/react/shared';
import { SwapView } from '@/features/swap/SwapView';
import { useSwapViewModel } from '@/features/swap/useSwapViewModel';

interface Props {
  offerDetail: OfferDetail;
  onBack: () => void;
}

export function SwapContainer({ offerDetail, onBack }: Props) {
  const { state, onEvent } = useSwapViewModel({ offerDetail, onBack });
  return <SwapView state={state} onEvent={onEvent} />;
}
