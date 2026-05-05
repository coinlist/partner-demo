import {
  OfferContainer,
  OfferDetailPreloadData,
} from "@/features/offer/OfferContainer";
import { coinListServer } from "@/lib/coinlist-server";
import { createNoOpCookiesSink } from "@/lib/session-store";
import { OfferId } from "@coinlist-co/react/server";
import { redirect } from "next/navigation";

export default async function OfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) {
    redirect("/");
  }
  const offerId = OfferId(id);

  const coinlistServer = coinListServer(createNoOpCookiesSink());
  const preloadDataArr = await Promise.all([
    coinlistServer.fetchOfferDetails(offerId),
    coinlistServer.fetchOfferRequirements(offerId),
    coinlistServer.fetchRequirementStatuses(offerId),
    coinlistServer.fetchAllParticipations(offerId),
  ]).catch(() => null);
  let preloadData: OfferDetailPreloadData | null = null;
  if (preloadDataArr) {
    preloadData = {
      offerDetail: preloadDataArr[0],
      requirements: preloadDataArr[1],
      requirementStatuses: preloadDataArr[2],
      participations: preloadDataArr[3],
    };
  }

  return <OfferContainer offerId={offerId} preloadData={preloadData} />;
}
