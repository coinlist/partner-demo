import { pinoClientLogger } from '@coinlist-co/react';
import type { Logger } from '@coinlist-co/react/shared';

/**
 * Whether this build is a development one.
 *
 * Read once, at module scope: Next.js inlines `NODE_ENV` at build time, so
 * this is a constant by the time it ships rather than something a request can
 * change.
 */
const IS_DEV = process.env.NODE_ENV !== 'production';

/**
 * The SDK's **browser** logger, at `debug` in development and **absent
 * entirely** in production. Its server counterpart is built inline in
 * `coinlist-server.ts`, which is `server-only` and must stay that way - the two
 * come from different entry points (`@coinlist-co/react` and
 * `.../server`), so pairing them in one module would drag the server build into
 * the client bundle.
 *
 * `debug` is the unredacted level: it carries request and response bodies,
 * full URLs with query strings, operation params and raw thrown errors. That
 * is exactly what makes it worth having while QA-ing a checkout - the Ondo
 * flow is a chain of HTTP calls, an approval and a broadcast, and at `info`
 * you see which step failed but not what it sent.
 *
 * It is also why this returns `undefined` rather than a quieter logger in
 * production. `PinoLoggerOptions` is a union, so `{ isDev: false, level:
 * 'debug' }` does not compile, and passing a computed boolean would not narrow
 * it - hence the explicit branch rather than
 * `pinoClientLogger({ isDev: IS_DEV, level: 'debug' })`. The SDK's own advice
 * is to leave `Config.logger` undefined in production, and a browser console is
 * readable by anyone with the page open, so the demo takes it.
 *
 * `NODE_ENV` is inlined by Next at build time, so the branch below is resolved
 * statically and the production bundle contains neither this call nor pino -
 * verified by planting a marker inside it and finding it absent from
 * `.next/static/chunks`.
 *
 * Records land in devtools as structured objects - `level`, `time`, `name`,
 * `scope`, plus the bindings (`requestId`, `flow`, `hook`, `op`) and fields -
 * the same shape the server writes as ndjson. Filter the console on `ONDO` for
 * the checkout's own lines, or on a `requestId` to follow one call through its
 * retries.
 */
export function demoSdkClientLogger(): Logger | undefined {
  if (!IS_DEV) return undefined;
  return pinoClientLogger({ isDev: true, level: 'debug' });
}
