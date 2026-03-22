import { getCoinListServer } from "@/lib/coinlist-server";
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  await getCoinListServer(res).logout();
  return res;
}
