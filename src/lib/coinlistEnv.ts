import { ClientId, RedirectUri } from '@coinlist-co/react/shared';
import { requiredEnv } from '@/lib/env';

/**
 * CoinList config, read from env in one place so the client and server can't drift.
 *
 * The two hosts map to differently-named SDK fields, which is the easy thing to
 * get wrong. Both default to production when unset.
 *
 *   apiBaseUrl -> `baseUrl`          data calls + token exchange
 *   webBaseUrl -> `coinlistBaseUrl`  OAuth authorize + redirects
 *
 * `COINLIST_CLIENT_SECRET` is deliberately absent. It stays in `coinlist-server.ts`
 * behind `server-only` so it can't reach the browser bundle.
 */
export const coinlistEnv = {
  clientId: ClientId(
    requiredEnv(
      'NEXT_PUBLIC_COINLIST_CLIENT_ID',
      process.env.NEXT_PUBLIC_COINLIST_CLIENT_ID
    )
  ),
  redirectUri: RedirectUri(
    requiredEnv(
      'NEXT_PUBLIC_COINLIST_REDIRECT_URI',
      process.env.NEXT_PUBLIC_COINLIST_REDIRECT_URI
    )
  ),
  apiBaseUrl: process.env.NEXT_PUBLIC_COINLIST_BASE_URL,
  webBaseUrl: process.env.NEXT_PUBLIC_COINLIST_WEB_URL,
} as const;
