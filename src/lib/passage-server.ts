import 'server-only';

import {
  createPassageServer,
  emptySessionStore,
  type PassageServer,
  pinoServerLogger,
  type SessionStore,
} from '@passage-cl/react/server';
import {
  type ClientCredentialsOAuth,
  ClientSecret,
} from '@passage-cl/react/universal';
import { coinlistEnv } from '@/lib/coinlistEnv';
import { requiredEnv } from '@/lib/env';
import { SDK_LOG_OPTIONS } from '@/lib/sdk-log-options';

// Built once rather than per call: the options are a build-time constant, and
// `passageServer` runs per request. Undefined against the production API,
// where the SDK is given no logger.
const logger = SDK_LOG_OPTIONS ? pinoServerLogger(SDK_LOG_OPTIONS) : undefined;

export function passageServer(sessionStore: SessionStore): PassageServer {
  return createPassageServer({
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
    // `logger: undefined`, as in `PassageProvider.tsx`.
    ...(logger ? { logger } : {}),
  });
}

const TOKEN_REFRESH_MARGIN_MS = 60_000;

// Cached in this process, so a deployment with several instances holds one
// token per instance.
let token: ClientCredentialsOAuth | null = null;
let tokenRequest: Promise<ClientCredentialsOAuth> | null = null;

/**
 * The partner's own `client_credentials` token, for reads and relayed calls
 * with no CoinList user. It acts for every one of the partner's users, so it
 * never leaves the server.
 */
export async function partnerToken(): Promise<ClientCredentialsOAuth> {
  if (
    token &&
    token.expiresAt.getTime() - Date.now() > TOKEN_REFRESH_MARGIN_MS
  ) {
    return token;
  }
  // Concurrent calls share one exchange rather than each minting a token.
  tokenRequest ??= passageServer(emptySessionStore())
    .auth.clientCredentials()
    .then((fresh) => {
      token = fresh;
      return fresh;
    })
    .finally(() => {
      tokenRequest = null;
    });
  return tokenRequest;
}
