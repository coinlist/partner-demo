import { coinListServer } from "@/lib/coinlist-server";
import { NextResponse } from "next/server";

export async function POST() {
  // The CoinList SDK deletes the cookie via the SessionStore
  // (cookies() from next/headers, which sets Set-Cookie on this response).
  await coinListServer().logout();
  return NextResponse.json({ ok: true });
}
