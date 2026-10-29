import { OfferId } from '@passage-cl/react/universal';
import { OfferContainer } from '@/features/offer/OfferContainer';
import { passageServer } from '@/lib/passage-server';
import { partnerToken } from '@/lib/relay';
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
  const { id } = await params;
  const offerDetail = await passage.offers
    .get(OfferId(id), await partnerToken())
    .catch(() => undefined);
  return <OfferContainer offerDetail={offerDetail} />;
}
