'use client';

import type { Offer } from '@coinlist-co/react/shared';
import { HomeView } from '@/features/home/HomeView';
import { useHomeViewModel } from '@/features/home/useHomeViewModel';

export interface Props {
  offers: Offer[] | undefined;
}

export function HomeContainer({ offers }: Props) {
  const { state, onEvent } = useHomeViewModel(offers);
  return <HomeView state={state} onEvent={onEvent} />;
}
