import 'server-only';

import {
  type CoinListServer,
  createCoinListServer,
  pinoServerLogger,
  type SessionStore,
} from '@coinlist-co/react/server';
import { ClientSecret } from '@coinlist-co/react/universal';
import { coinlistEnv } from '@/lib/coinlistEnv';
import { requiredEnv } from '@/lib/env';
import { SDK_LOG_OPTIONS } from '@/lib/sdk-log-options';

// Built once rather than per call: the options are a build-time constant, and
// `coinListServer` runs per request. Undefined against the production API,
// where the SDK is given no logger.
const logger = SDK_LOG_OPTIONS ? pinoServerLogger(SDK_LOG_OPTIONS) : undefined;

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
    // The server half of the same seam. This is where the OAuth token exchange
    // is reported, which the browser never sees. Spread rather than
    // `logger: undefined`, as in `CoinListProvider.tsx`.
    ...(logger ? { logger } : {}),
  });
}
