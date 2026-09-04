import 'server-only';

import {
  type CoinListServer,
  createCoinListServer,
  pinoServerLogger,
  type SessionStore,
} from '@coinlist-co/react/server';
import { ClientSecret } from '@coinlist-co/react/shared';
import { coinlistEnv } from '@/lib/coinlistEnv';
import { requiredEnv } from '@/lib/env';
import { UNREDACTED_LOGGING_ALLOWED } from '@/lib/sdk-logging';

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
    // The server half of the same seam, under the same shared rule. This is
    // where the OAuth token exchange is reported, which the browser cannot see.
    //
    // At `debug` this stream carries the `COINLIST_CLIENT_SECRET`: the SDK logs
    // POST bodies verbatim, and `/oauth/token` posts the secret and the refresh
    // token and gets both tokens back. Treat stdout as a secret - pipe it to
    // read it (`npm run dev | npx pino-pretty`), never redirect it to a file or
    // run it where output is retained, CI included.
    logger: UNREDACTED_LOGGING_ALLOWED
      ? pinoServerLogger({ isDev: true, level: 'debug' })
      : undefined,
  });
}
