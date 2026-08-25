import { HomeContainer } from '@/features/home/HomeContainer';
import { LoginContainer } from '@/features/login/LoginContainer';
import { coinListServer } from '@/lib/coinlist-server';
import { readOnlySessionStore } from '@/lib/session-store';

export default async function HomePage() {
  const coinlist = coinListServer(readOnlySessionStore());
  if (await coinlist.auth.getAccessToken()) {
    const offers = await coinlist.offers.list().catch(() => undefined);
    return <HomeContainer offers={offers} />;
  } else {
    return <LoginContainer />;
  }
}
