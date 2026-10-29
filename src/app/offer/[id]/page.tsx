import { OfferId } from '@passage-cl/react/universal';
import { OfferContainer } from '@/features/offer/OfferContainer';
import { partnerToken, passageServer } from '@/lib/passage-server';
import { readOnlySessionStore } from '@/lib/session-store';

export default async function OfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const passage = passageServer(readOnlySessionStore());
  if (await passage.auth.getAccessToken()) return <OfferContainer />;

  // An address-only visitor has no token for the browser to read the offer
  // with, so the server reads it with the partner token.
  const offerDetail = await Promise.all([params, partnerToken()])
    .then(([{ id }, token]) => passage.offers.get(OfferId(id), token))
    .catch(() => undefined);
  return <OfferContainer offerDetail={offerDetail} />;
}
