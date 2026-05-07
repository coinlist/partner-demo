import { HomeContainer } from "@/features/home/HomeContainer";
import { LoginContainer } from "@/features/login/LoginContainer";
import { coinListServer } from "@/lib/coinlist-server";

export default async function HomePage() {
  const coinlist = coinListServer();
  const validAccessToken = await coinlist.accessToken();
  if (validAccessToken) {
    const offers = await coinlist.fetchOffers().catch(() => undefined);
    return <HomeContainer offers={offers} />;
  } else {
    return <LoginContainer />;
  }
}
