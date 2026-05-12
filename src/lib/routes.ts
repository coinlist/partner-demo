import type { OfferId, OfferOptionId } from '@coinlist-co/react/shared';

export const ROUTES = {
  ROOT: '/',
  SETTINGS: '/settings',
  OFFER_DETAILS: (id: OfferId): string => `/offer/${id}`,
  OFFER_INVEST: (id: OfferId, optionId: OfferOptionId): string =>
    `/offer/${id}/invest?optionId=${optionId}`,
};
