import { pinoClientLogger } from '@coinlist-co/react';
import type { Logger } from '@coinlist-co/react/shared';
import { UNREDACTED_LOGGING_ALLOWED } from '@/lib/sdk-debug-logging';

/**
 * The SDK's browser logger at `debug`, absent unless
 * {@link UNREDACTED_LOGGING_ALLOWED}. Its server counterpart is built inline in
 * `coinlist-server.ts`: the two come from different entry points, so pairing
 * them here would drag the server build into the client bundle.
 *
 * `undefined` rather than a quieter logger - `PinoLoggerOptions` is a union, so
 * `{ isDev: false, level: 'debug' }` does not compile and a computed boolean
 * would not narrow it.
 *
 * To check a production build, grep the wiring (`logger: void 0` in the built
 * config) rather than the symbols: pino ships regardless via
 * `@walletconnect/logger`, and `pinoClientLogger` may survive as an uncalled
 * entry in the SDK's export table.
 */
export function demoSdkClientLogger(): Logger | undefined {
  if (!UNREDACTED_LOGGING_ALLOWED) return undefined;
  return pinoClientLogger({ isDev: true, level: 'debug' });
}
