'use client';

import type { Offer } from '@coinlist-co/react/shared';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

export type HomeUiState = {
  preloadedOffers: Offer[] | undefined;
};

export type HomeUiEvent =
  | {
      type: 'ON_SETTINGS_CLICK';
    }
  | {
      type: 'ON_OFFER_CLICK';
      offer: Offer;
    };

export function useHomeViewModel(offers: Offer[] | undefined): {
  state: HomeUiState;
  onEvent: (event: HomeUiEvent) => void;
} {
  const router = useRouter();

  const state: HomeUiState = {
    preloadedOffers: offers,
  };

  const onEvent = (event: HomeUiEvent) => {
    switch (event.type) {
      case 'ON_SETTINGS_CLICK':
        router.push(ROUTES.SETTINGS);
        break;
      case 'ON_OFFER_CLICK':
        router.push(ROUTES.OFFER_DETAILS(event.offer.id));
        break;
    }
  };

  return {
    state,
    onEvent,
  };
}
