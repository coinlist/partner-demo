import { ClientId, RedirectUri } from '@coinlist-co/react/shared';
import { requiredEnv } from '@/lib/env';

/**
 * CoinList host + identity config, read once from env and mapped to the SDK's
 * config field names so the client and server providers can't drift.
 *
 * Client-safe by construction: every value is a `NEXT_PUBLIC_` var or derived
 * from one. The server secret (`COINLIST_CLIENT_SECRET`) is intentionally NOT
 * here — it stays in `coinlist-server.ts` behind `server-only` so it never
 * lands in the browser bundle.
 *
 * The two host vars map to two DIFFERENT SDK fields — the footgun this module
 * exists to prevent:
 *   NEXT_PUBLIC_COINLIST_BASE_URL -> SDK `baseUrl`         (API host: data calls + token exchange)
 *   NEXT_PUBLIC_COINLIST_WEB_URL  -> SDK `coinlistBaseUrl` (web host: OAuth authorize + redirects)
 * Both default to production inside the SDK when left undefined.
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
  /** SDK `baseUrl` — API host (client data calls + server token exchange). */
  apiBaseUrl: process.env.NEXT_PUBLIC_COINLIST_BASE_URL,
  /** SDK client `coinlistBaseUrl` — web host (OAuth authorize + redirects). */
  webBaseUrl: process.env.NEXT_PUBLIC_COINLIST_WEB_URL,
} as const;
