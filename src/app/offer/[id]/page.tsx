import { OfferId, signInMethodFor } from '@passage-cl/react/universal';
import { OfferContainer } from '@/features/offer/OfferContainer';
import { partnerToken, passageServer } from '@/lib/passage-server';
import { readOnlySessionStore } from '@/lib/session-store';

export default async function OfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const passage = passageServer(readOnlySessionStore());
  const session = await passage.auth.getAccessToken();
  if (session?.signInMethod.method === 'coinlist') return <OfferContainer />;

  // A visitor with no CoinList account, signed out or signed in with a
  // wallet, has no token the browser can read the offer with, so the server
  // reads it, and which sign-in each option takes, with the partner token.
  const [{ id }, token] = await Promise.all([params, partnerToken()]);
  const offerId = OfferId(id);
  const [offerDetail, requirementsByOption] = await Promise.all([
    passage.offers.get(offerId, token).catch(() => undefined),
    passage.requirements.forOffer(offerId, token).catch(() => undefined),
  ]);
  return (
    <OfferContainer
      withoutAccount={{
        offerDetail,
        signInByOption: Object.fromEntries(
          Object.entries(requirementsByOption ?? {}).map(
            ([optionId, requirements]) => [
              optionId,
              signInMethodFor(requirements),
            ]
          )
        ),
      }}
    />
  );
}
