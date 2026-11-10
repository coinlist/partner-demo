import type { OfferId } from '@passage-cl/react/universal';

export const ROUTES = {
  ROOT: '/',
  SETTINGS: '/settings',
  USDZ_FAUCET: '/usdz-faucet',
  OFFER_DETAILS: (id: OfferId): string => `/offer/${encodeURIComponent(id)}`,
};
