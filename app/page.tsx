import { HomeContainer } from "@/features/home/HomeContainer";
import { LoginContainer } from "@/features/login/LoginContainer";
import { coinListServer } from "@/lib/coinlist-server";
import { getServerSession } from "@/lib/session-store";

export default async function HomePage() {
  const session = await getServerSession();

  if (!session) {
    return <LoginContainer />;
  }

  const isTokenExpired = session.accessToken.expiresAt <= new Date();
  if (isTokenExpired) {
    return <HomeContainer offers={undefined} />;
  }

  const offers = await coinListServer().fetchOffers().catch(() => undefined);
  return <HomeContainer offers={offers} />;
}
