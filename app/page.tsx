import { HomeView } from "@/features/home/HomeView";
import { LoginContainer } from "@/features/login/LoginContainer";
import { coinListServer } from "@/lib/coinlist-server";
import { NO_OP_COOKIES_SINK } from "@/lib/session-store";

export default async function HomePage() {
  const coinlistServer = coinListServer(NO_OP_COOKIES_SINK);
  const loggedIn = await coinlistServer.accessToken().catch(() => null);
  if (loggedIn) {
    return <HomeView />;
  } else {
    return <LoginContainer />;
  }
}
