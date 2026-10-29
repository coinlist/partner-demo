import type { OfferId } from '@passage-cl/react/universal';

export const ROUTES = {
  ROOT: '/',
  SETTINGS: '/settings',
  ADDRESS: '/address',
  OFFER_DETAILS: (id: OfferId): string => `/offer/${encodeURIComponent(id)}`,
};
