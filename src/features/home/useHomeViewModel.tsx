'use client';

import { useTokenRegistry } from '@coinlist-co/react';
import type {
  Offer,
  TokenMetadata,
  TokenRegistrySnapshot,
} from '@coinlist-co/react/universal';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { ROUTES } from '@/lib/routes';

export type HomeUiState = {
  tokenSaleOffers: Offer[];
  ondoOffers: Offer[];
  superstateOffers: Offer[];
  isEmpty: boolean;
  /**
   * The Nabu token registry, indexed for per-offer lookups; `null` while it
   * loads or when it could not be read, in which case cards fall back to the
   * offer's own fields.
   */
  registry: TokenRegistrySnapshot | null;
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
  tokens: TokenMetadata[] | undefined
): {
  state: HomeUiState;
  onEvent: (event: HomeUiEvent) => void;
} {
  const router = useRouter();
  // Seeded from the server when the page had it; fetched here otherwise.
  const { state: registryState } = useTokenRegistry({ data: tokens });
  const registry =
    registryState.type === 'CONTENT' ? registryState.registry : null;

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
      registry,
    };
  }, [offers, registry]);

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
