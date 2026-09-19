import { OfferId } from '@coinlist-co/react/universal';
import { OfferContainer } from '@/features/offer/OfferContainer';
import { coinListServer } from '@/lib/coinlist-server';
import { readOnlySessionStore } from '@/lib/session-store';
import { loadTokenDisplays } from '@/lib/token-display.server';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OfferPage({ params }: Props) {
  const { id } = await params;
  const coinlist = coinListServer(readOnlySessionStore());
  // Frontline's `logo_url` is optional and blank on most swap offers; the Nabu
  // token registry is the source of the token's logo, as on frontline-web.
  const [offerDetail, displayOf] = await Promise.all([
    coinlist.offers.get(OfferId(id)).catch(() => null),
    loadTokenDisplays(coinlist),
  ]);
  const tokenDisplay = offerDetail ? displayOf(offerDetail) : null;

  return <OfferContainer tokenDisplay={tokenDisplay} />;
}
