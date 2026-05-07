import { HomeContainer } from "@/features/home/HomeContainer";
import { LoginContainer } from "@/features/login/LoginContainer";
import { coinListServer } from "@/lib/coinlist-server";
import { hasSession } from "@/lib/session-store";

export default async function HomePage() {
  if (await hasSession()) {
    const offers = await coinListServer()
      .fetchOffers()
      .catch(() => undefined);
    return <HomeContainer offers={offers} />;
  } else {
    return <LoginContainer />;
  }
}
