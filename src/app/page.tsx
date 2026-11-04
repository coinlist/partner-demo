import type { OfferType } from '@passage-cl/react/universal';
import { HomeContainer } from '@/features/home/HomeContainer';
import { LoginContainer } from '@/features/login/LoginContainer';
import { partnerToken, passageServer } from '@/lib/passage-server';
import { readOnlySessionStore } from '@/lib/session-store';

/** The offer types a wallet session can trade; the rest need a CoinList user. */
const WALLET_OFFER_TYPES: readonly OfferType[] = [
  'ondo::swap',
  'centrifuge::vault',
];

type PassageServer = ReturnType<typeof passageServer>;

/** A wallet session reaches only checkout calls, so the partner token reads. */
async function listOffersForWallet(passage: PassageServer) {
  const offers = await passage.offers.list(await partnerToken());
  return offers.filter((offer) => WALLET_OFFER_TYPES.includes(offer.type));
}

export default async function HomePage() {
  const passage = passageServer(readOnlySessionStore());
  const token = await passage.auth.getAccessToken();
  if (token) {
    // Both pre-fetched here and handed down as `data`, so the home page makes
    // no client-side request. Either may fail independently: the hooks then
    // fetch that half in the browser.
    const [offers, tokens] = await Promise.all([
      (token.signInMethod.method === 'wallet'
        ? listOffersForWallet(passage)
        : passage.offers.list()
      ).catch(() => undefined),
      passage.tokens.list().catch(() => undefined),
    ]);
    return <HomeContainer offers={offers} tokens={tokens} />;
  } else {
    return <LoginContainer />;
  }
}
