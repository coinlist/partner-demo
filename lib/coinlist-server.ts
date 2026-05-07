import "server-only";

import {
  createCoinListServer,
  type CoinListServer,
  type SessionStore,
} from "@coinlist-co/react/server";
import { ClientId, ClientSecret, RedirectUri } from "@coinlist-co/react/shared";
import { requiredEnv } from "./env";

export function coinListServer(
  sessionStore: SessionStore = createNextHeadersCookiesStore(),
): CoinListServer {
  return createCoinListServer({
    clientId: ClientId(
      requiredEnv(
        "NEXT_PUBLIC_COINLIST_CLIENT_ID",
        process.env.NEXT_PUBLIC_COINLIST_CLIENT_ID,
      ),
    ),
    clientSecret: ClientSecret(
      requiredEnv("COINLIST_CLIENT_SECRET", process.env.COINLIST_CLIENT_SECRET),
    ),
    redirectUri: RedirectUri(
      requiredEnv(
        "NEXT_PUBLIC_COINLIST_REDIRECT_URI",
        process.env.NEXT_PUBLIC_COINLIST_REDIRECT_URI,
      ),
    ),
    sessionStore,
  });
}
