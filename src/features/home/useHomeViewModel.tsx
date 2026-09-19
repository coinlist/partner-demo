'use client';

import type { Offer } from '@coinlist-co/react/universal';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { ROUTES } from '@/lib/routes';
import type { TokenDisplay } from '@/lib/token-display.server';

export type HomeUiState = {
  tokenSaleOffers: Offer[];
  ondoOffers: Offer[];
  superstateOffers: Offer[];
  isEmpty: boolean;
  /** Registry display per offer id; `null` when the registry lists none. */
  tokenDisplays: Record<string, TokenDisplay | null>;
};

export type HomeUiEvent =
  | {
      type: 'ON_SETTINGS_CLICK';
    }
  | {
      type: 'ON_OFFER_CLICK';
      offer: Offer;
    };

export function useHomeViewModel(
  offers: Offer[] | undefined,
  tokenDisplays: Record<string, TokenDisplay | null>
): {
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
      tokenDisplays,
    };
  }, [offers, tokenDisplays]);

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
