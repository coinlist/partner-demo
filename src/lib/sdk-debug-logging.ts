import { coinlistEnv } from '@/lib/coinlistEnv';

/**
 * Whether this build may run the SDK's loggers at `debug` - the unredacted
 * level, which carries bodies, headers and params verbatim: bearer tokens, KYC
 * answers, and on the server the `client_secret`.
 *
 * `NODE_ENV` is assigned by Next rather than read from `.env` (`next dev` is
 * development, `next build` and `next start` are production) and inlined at
 * build time, so a deployed server cannot be talked into `debug` by an
 * environment variable and both call sites fold to `logger: undefined`.
 *
 * An unset `NEXT_PUBLIC_COINLIST_BASE_URL` means the production API and so
 * real customer data, which ADR-8 puts out of scope for `debug` whatever the
 * build. Shared by both loggers so the policy cannot drift between them.
 */
export const UNREDACTED_LOGGING_ALLOWED: boolean =
  process.env.NODE_ENV !== 'production' && coinlistEnv.apiBaseUrl !== undefined;
