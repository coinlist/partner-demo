import { OfferId } from '@coinlist-co/react/shared';
import { redirect } from 'next/navigation';
import { InvestContainer } from '@/features/invest/InvestContainer';
import { coinListServer } from '@/lib/coinlist-server';
import { readOnlySessionStore } from '@/lib/session-store';
import { ROUTES } from '@/lib/routes';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ optionId?: string }>;
}

export default async function InvestPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { optionId } = await searchParams;

  let offerDetail;
  try {
    offerDetail = await coinListServer(readOnlySessionStore()).fetchOfferDetails(OfferId(id));
  } catch {
    redirect(ROUTES.OFFER_DETAILS(OfferId(id)));
  }

  const option =
    offerDetail.options.find((o) => o.id.toString() === optionId) ??
    offerDetail.options[0] ??
    null;

  if (!option) {
    redirect(ROUTES.OFFER_DETAILS(OfferId(id)));
  }

  return <InvestContainer offerDetail={offerDetail} option={option} />;
}
