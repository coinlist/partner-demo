import type { OfferId, OfferOptionId } from '@coinlist-co/react/shared';

export const ROUTES = {
  ROOT: '/',
  SETTINGS: '/settings',
  OFFER_DETAILS: (id: OfferId): string => `/offer/${encodeURIComponent(id)}`,
  OFFER_INVEST: (id: OfferId, optionId: OfferOptionId): string =>
    `/offer/${encodeURIComponent(id)}/invest?optionId=${encodeURIComponent(optionId)}`,
};
