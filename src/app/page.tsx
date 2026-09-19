import { HomeContainer } from '@/features/home/HomeContainer';
import { LoginContainer } from '@/features/login/LoginContainer';
import { coinListServer } from '@/lib/coinlist-server';
import { readOnlySessionStore } from '@/lib/session-store';
import { loadTokenDisplays } from '@/lib/token-display.server';

export default async function HomePage() {
  const coinlist = coinListServer(readOnlySessionStore());
  if (await coinlist.auth.getAccessToken()) {
    const [offers, displayOf] = await Promise.all([
      coinlist.offers.list().catch(() => undefined),
      loadTokenDisplays(coinlist),
    ]);
    const tokenDisplays = Object.fromEntries(
      (offers ?? []).map((offer) => [offer.id, displayOf(offer)])
    );
    return <HomeContainer offers={offers} tokenDisplays={tokenDisplays} />;
  } else {
    return <LoginContainer />;
  }
}
