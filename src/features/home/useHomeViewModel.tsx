'use client';

import type { Offer } from '@coinlist-co/react/universal';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { ROUTES } from '@/lib/routes';

export type HomeUiState = {
  tokenSaleOffers: Offer[];
  ondoOffers: Offer[];
  superstateOffers: Offer[];
  isEmpty: boolean;
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

  const state = useMemo((): HomeUiState => {
    const list = offers ?? [];
    const tokenSaleOffers = list.filter(
      (o) => o.type === 'coinlist::token_sale'
    );
    const ondoOffers = list.filter((o) => o.type === 'ondo::swap');
    const superstateOffers = list.filter((o) => o.type === 'superstate::swap');
    return {
      tokenSaleOffers,
      ondoOffers,
      superstateOffers,
      isEmpty:
        tokenSaleOffers.length === 0 &&
        ondoOffers.length === 0 &&
        superstateOffers.length === 0,
    };
  }, [offers]);

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
