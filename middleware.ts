import { NextRequest, NextResponse } from "next/server";
import { coinListServer } from "@/lib/coinlist-server";
import { cookiesSessionStore } from "@/lib/session-store";

export async function middleware(request: NextRequest) {
  const { store, applyCookies } = cookiesSessionStore(request);
  try {
    await coinListServer(store).accessToken();
  } catch {
    return NextResponse.next(); // degrade gracefully
  }
  return applyCookies(NextResponse.next());
}
