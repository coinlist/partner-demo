import 'server-only';

import {
  type CoinListServer,
  createCoinListServer,
  type SessionStore,
} from '@coinlist-co/react/server';
import { ClientSecret } from '@coinlist-co/react/shared';
import { coinlistEnv } from '@/lib/coinlistEnv';
import { requiredEnv } from '@/lib/env';

export function coinListServer(sessionStore: SessionStore): CoinListServer {
  return createCoinListServer({
    clientId: coinlistEnv.clientId,
    // Server-only secret — kept out of coinlistEnv so it never reaches the
    // client bundle (this module is `server-only`).
    clientSecret: ClientSecret(
      requiredEnv('COINLIST_CLIENT_SECRET', process.env.COINLIST_CLIENT_SECRET)
    ),
    redirectUri: coinlistEnv.redirectUri,
    // API host (SDK `baseUrl`) for token exchange + data. Unset = production.
    baseUrl: coinlistEnv.apiBaseUrl,
    sessionStore,
  });
}
