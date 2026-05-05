import { HomeContainer } from "@/features/home/HomeContainer";
import { LoginContainer } from "@/features/login/LoginContainer";
import { coinListServer } from "@/lib/coinlist-server";
import { getServerSession } from "@/lib/session-store";

export default async function HomePage() {
  // Read the session directly from the cookie WITHOUT going through the SDK.
  // Calling coinListServer().accessToken() here would trigger a token refresh
  // when the access token is expired: the SDK would consume the refresh token
  // via the CoinList token endpoint but, because cookies() is read-only in
  // Server Components, the new session could never be written back to the
  // browser. The browser would therefore keep the now-invalidated refresh
  // token, causing every subsequent renewal attempt (via the Route Handler)
  // to fail and silently log the user out.
  //
  // Instead we check the raw session ourselves:
  //   • No session cookie   → show login view.
  //   • Session cookie exists with a still-valid access token → pre-fetch
  //     offers for SSR (the access token is not expired so no refresh fires).
  //   • Session cookie exists but token is already expired → show the home
  //     view without pre-fetched offers; the client-side CoinListProvider will
  //     call GET /api/coinlist/oauth/access-token which IS a Route Handler and
  //     CAN persist the refreshed session cookie.
  const session = await getServerSession();

  if (!session) {
    return <LoginContainer />;
  }

  const isTokenExpired = session.accessToken.expiresAt <= new Date();
  if (isTokenExpired) {
    // Let the client handle the token refresh via the Route Handler.
    return <HomeContainer offers={undefined} />;
  }

  const offers = await coinListServer().fetchOffers().catch(() => undefined);
  return <HomeContainer offers={offers} />;
}
