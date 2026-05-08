import type { OfferId } from '@coinlist-co/react/shared';

export const ROUTES = {
  ROOT: '/',
  SETTINGS: '/settings',
  OFFER_DETAILS: (id: OfferId): string => `/offer/${id}`,
};
