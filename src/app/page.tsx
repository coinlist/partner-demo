import { HomeContainer } from '@/features/home/HomeContainer';
import { LoginContainer } from '@/features/login/LoginContainer';
import { coinListServer } from '@/lib/coinlist-server';
import { readOnlySessionStore } from '@/lib/session-store';

export default async function HomePage() {
  const coinlist = coinListServer(readOnlySessionStore());
  if (await coinlist.auth.getAccessToken()) {
    // Both pre-fetched here and handed down as `data`, so the home page makes
    // no client-side request. Either may fail independently: the hooks then
    // fetch that half in the browser.
    const [offers, tokens] = await Promise.all([
      coinlist.offers.list().catch(() => undefined),
      coinlist.tokens.list().catch(() => undefined),
    ]);
    return <HomeContainer offers={offers} tokens={tokens} />;
  } else {
    return <LoginContainer />;
  }
}
