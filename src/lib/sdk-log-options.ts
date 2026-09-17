import type { PinoLoggerOptions } from '@coinlist-co/react/universal';
import { coinlistEnv } from '@/lib/coinlistEnv';

/**
 * Which of the three rungs this build sits on. Named rather than inlined
 * because the derivation below reads two signals to answer one question, and
 * the answer is what the policy actually switches on.
 */
type SdkLogAudience = 'production-api' | 'deployed-demo' | 'local-dev';

/**
 * How much the CoinList SDK may report.
 *
 * `undefined` means the seam is absent rather than configured off: an omitted
 * `Config.logger` makes the SDK emit nothing on any codepath, with no
 * `console` fallback and no event lambda ever invoked. That is a property that
 * cannot regress, which a logger answering `'none'` is not - so both call
 * sites spread this in rather than passing `logger: undefined`.
 *
 * The rung is derived rather than configured: there is no variable naming the
 * deployment, and the two signals this app already has say the same thing
 * between them:
 *
 *   - An unset `NEXT_PUBLIC_COINLIST_BASE_URL` is the production CoinList API,
 *     and so real customer data. That is out of scope for logging nobody asked
 *     for, whatever the build - hence no seam at all.
 *   - `NODE_ENV` is assigned by Next rather than read from `.env` (`next dev`
 *     is development, `next build` and `next start` are production) and is
 *     inlined at build time, so a deployed demo cannot be talked into `debug`
 *     by an environment variable.
 *
 * `isDev` gates nothing but whether `'debug'` is a legal level, so a deployed
 * demo gets `false` and the unredacted level stops compiling there.
 *
 * Derived from the build alone, with no env-var override: an override knob is
 * also a way to switch production logging back on.
 */
function sdkLogOptions(
  audience: SdkLogAudience
): PinoLoggerOptions | undefined {
  switch (audience) {
    case 'production-api':
      return undefined;
    case 'deployed-demo':
      return { isDev: false, level: 'info' };
    case 'local-dev':
      return { isDev: true, level: 'debug' };
    default: {
      const exhaustive: never = audience;
      return exhaustive;
    }
  }
}

/**
 * The production API outranks the build: pointing a `next dev` server at real
 * customer data must not unlock `debug` just because the machine is a laptop.
 *
 * Blank counts as unset, matching the `Boolean(...)` pairing guard in
 * `coinlistEnv`. An `=== undefined` test here would disagree with it, and
 * `NEXT_PUBLIC_COINLIST_BASE_URL=` in a `.env` would then read as a non-prod
 * host and unlock `debug` against real customer data.
 */
function sdkLogAudience(
  apiBaseUrl: string | undefined,
  nodeEnv: string | undefined
): SdkLogAudience {
  if (!apiBaseUrl) return 'production-api';
  return nodeEnv === 'production' ? 'deployed-demo' : 'local-dev';
}

/**
 * Resolved once, and shared by the client and server loggers so the policy
 * cannot drift between them.
 *
 * At `'debug'` this stream carries request and response bodies, full URLs and
 * wallet signatures verbatim - and on the server the `COINLIST_CLIENT_SECRET`,
 * since `/oauth/token` posts it and gets both tokens back. Treat that stdout
 * as a secret: pipe it to read it (`npm run dev | npx pino-pretty`), never
 * redirect it to a file or run it where output is retained, CI included.
 */
export const SDK_LOG_OPTIONS: PinoLoggerOptions | undefined = sdkLogOptions(
  sdkLogAudience(coinlistEnv.apiBaseUrl, process.env.NODE_ENV)
);
