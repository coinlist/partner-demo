import { coinListServer } from "@/lib/coinlist-server";
import { createRouteHandlerCookiesStore } from "@/lib/session-store";
import { NextResponse } from "next/server";

export async function POST() {
  const { store, applyCookies } = createRouteHandlerCookiesStore();
  await coinListServer(store).logout();
  return applyCookies(NextResponse.json({ ok: true }));
}
