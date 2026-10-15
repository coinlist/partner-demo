import type { OfferId } from '@coinlist-co/react/universal';

export const ROUTES = {
  ROOT: '/',
  SETTINGS: '/settings',
  OFFER_DETAILS: (id: OfferId): string => `/offer/${encodeURIComponent(id)}`,
};
