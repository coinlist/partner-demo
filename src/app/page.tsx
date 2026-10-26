import { HomeContainer } from '@/features/home/HomeContainer';
import { LoginContainer } from '@/features/login/LoginContainer';
import { passageServer } from '@/lib/passage-server';
import { readOnlySessionStore } from '@/lib/session-store';

export default async function HomePage() {
  const passage = passageServer(readOnlySessionStore());
  if (await passage.auth.getAccessToken()) {
    // Both pre-fetched here and handed down as `data`, so the home page makes
    // no client-side request. Either may fail independently: the hooks then
    // fetch that half in the browser.
    const [offers, tokens] = await Promise.all([
      passage.offers.list().catch(() => undefined),
      passage.tokens.list().catch(() => undefined),
    ]);
    return <HomeContainer offers={offers} tokens={tokens} />;
  } else {
    return <LoginContainer />;
  }
}
