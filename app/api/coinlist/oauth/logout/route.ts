import { coinListServer } from "@/lib/coinlist-server";
import { cookiesSessionStore } from "@/lib/session-store";
import { NextResponse } from "next/server";

export async function POST() {
  const { store, applyCookies } = cookiesSessionStore();
  await coinListServer(store).logout();
  return applyCookies(NextResponse.json({ ok: true }));
}
