'use client';

import type { Offer, TokenMetadata } from '@coinlist-co/react/universal';
import { HomeView } from '@/features/home/HomeView';
import { useHomeViewModel } from '@/features/home/useHomeViewModel';

export interface Props {
  offers: Offer[] | undefined;
  /** The token registry snapshot, pre-fetched on the server. */
  tokens: TokenMetadata[] | undefined;
}

export function HomeContainer({ offers, tokens }: Props) {
  const { state, onEvent } = useHomeViewModel(offers, tokens);
  return <HomeView state={state} onEvent={onEvent} />;
}
