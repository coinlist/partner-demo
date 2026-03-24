import "server-only";

import type { NextResponse } from "next/server";
import type { CoinListServer } from "coinlist-react/server";
import {
  ClientId,
  ClientSecret,
  createCoinListServer,
  RedirectUri,
} from "coinlist-react/server";
import { createSessionCookiesStore } from "./session-store";
import { requiredEnv } from "./env";

export function getCoinListServer(
  outgoingResponse?: NextResponse,
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
    sessionStore: createSessionCookiesStore(outgoingResponse),
  });
}
