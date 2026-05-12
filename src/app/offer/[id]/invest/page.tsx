import {
  type OfferDetail,
  OfferId,
  type OfferOption,
} from '@coinlist-co/react/shared';
import { redirect } from 'next/navigation';
import { InvestContainer } from '@/features/invest/InvestContainer';
import { coinListServer } from '@/lib/coinlist-server';
import { ROUTES } from '@/lib/routes';
import { readOnlySessionStore } from '@/lib/session-store';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ optionId?: string }>;
}

export default async function InvestPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { optionId } = await searchParams;

  let offerDetail: OfferDetail;
  try {
    offerDetail = await coinListServer(
      readOnlySessionStore()
    ).fetchOfferDetails(OfferId(id));
  } catch {
    redirect(ROUTES.OFFER_DETAILS(OfferId(id)));
  }

  const option: OfferOption | undefined =
    offerDetail.options.find(
      (o: OfferOption) => o.id.toString() === optionId
    ) ?? offerDetail.options[0];

  if (!option) {
    redirect(ROUTES.OFFER_DETAILS(OfferId(id)));
  }

  return <InvestContainer offerDetail={offerDetail} option={option} />;
}
