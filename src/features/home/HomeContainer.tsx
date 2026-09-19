'use client';

import type { Offer } from '@coinlist-co/react/universal';
import { HomeView } from '@/features/home/HomeView';
import { useHomeViewModel } from '@/features/home/useHomeViewModel';
import type { TokenDisplay } from '@/lib/token-display.server';

export interface Props {
  offers: Offer[] | undefined;
  /** Registry display per offer id; `null` when the registry lists none. */
  tokenDisplays: Record<string, TokenDisplay | null>;
}

export function HomeContainer({ offers, tokenDisplays }: Props) {
  const { state, onEvent } = useHomeViewModel(offers, tokenDisplays);
  return <HomeView state={state} onEvent={onEvent} />;
}
