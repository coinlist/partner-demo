import { emptySessionStore } from '@passage-cl/react/server';
import { HomeContainer } from '@/features/home/HomeContainer';
import { passageServer } from '@/lib/passage-server';
import { partnerToken } from '@/lib/relay';

// Nothing here reads the request, so Next would otherwise render it once at
// build time, with the partner secret, and serve that list for good.
export const dynamic = 'force-dynamic';

/**
 * The address-only entry: Ondo offers for a visitor with a connected wallet
 * and no CoinList login. The list is read with the partner token, and the
 * checkout's Ondo calls go through the relay.
 */
export default async function AddressPage() {
  const passage = passageServer(emptySessionStore());
  const [offers, tokens] = await Promise.all([
    passage.offers
      .list(await partnerToken())
      .then((all) => all.filter((offer) => offer.type === 'ondo::swap'))
      .catch(() => undefined),
    passage.tokens.list().catch(() => undefined),
  ]);
  return <HomeContainer offers={offers} tokens={tokens} />;
}
