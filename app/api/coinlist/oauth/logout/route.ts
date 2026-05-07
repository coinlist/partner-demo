import { coinListServer } from "@/lib/coinlist-server";
import { cookiesSessionStore } from "@/lib/session-store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { store, applyCookies } = cookiesSessionStore(request);
  await coinListServer(store).logout();
  return applyCookies(NextResponse.json({ ok: true }));
}
