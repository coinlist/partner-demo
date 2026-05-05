import { HomeContainer } from "@/features/home/HomeContainer";
import { LoginContainer } from "@/features/login/LoginContainer";
import { coinListServer } from "@/lib/coinlist-server";
import { createNoOpCookiesSink } from "@/lib/session-store";

export default async function HomePage() {
  const coinlistServer = coinListServer(createNoOpCookiesSink());
  const loggedIn = await coinlistServer.accessToken().catch(() => null);
  if (loggedIn) {
    const offers = await coinlistServer.fetchOffers().catch(() => undefined);
    return <HomeContainer offers={offers} />;
  } else {
    return <LoginContainer />;
  }
}
