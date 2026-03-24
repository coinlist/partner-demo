import { getCoinListServer } from "@/lib/coinlist-server";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // The CoinList SDK will delete the cookie via the SessionStore that you provided
  await getCoinListServer(response).logout();
  return response;
}
