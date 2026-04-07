import { HomeContainer } from "@/features/home/HomeContainer";
import { LoginContainer } from "@/features/login/LoginContainer";
import { coinListServer } from "@/lib/coinlist-server";
import { NO_OP_COOKIES_SINK } from "@/lib/session-store";
import { Suspense } from "react";

export default async function HomePage() {
  const coinlistServer = coinListServer(NO_OP_COOKIES_SINK);
  const loggedIn = await coinlistServer.accessToken().catch(() => null);
  if (loggedIn) {
    return <HomeContainer />;
  } else {
    return (
      <Suspense fallback={null}>
        <LoginContainer />
      </Suspense>
    );
  }
}
