import { HomeContainer } from "@/features/home/HomeContainer";
import { LoginContainer } from "@/features/login/LoginContainer";
import { coinListServer } from "@/lib/coinlist-server";
import { getSessionOrNull, validAccessToken } from "@/lib/session-store";
import { Offer } from "@coinlist-co/react/shared";

export default async function HomePage() {
  const session = await getSessionOrNull();
  if (session) {
    let offers: Offer[] | undefined = undefined;
    if (validAccessToken(session)) {
      offers = await coinListServer()
        .fetchOffers()
        .catch(() => undefined);
    }
    return <HomeContainer offers={offers} />;
  } else {
    return <LoginContainer />;
  }
}
