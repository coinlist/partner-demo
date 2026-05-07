import { coinListServer } from "@/lib/coinlist-server";
import { cookiesSessionStore } from "@/lib/session-store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { store, applyCookies } = cookiesSessionStore(request);
  const token = await coinListServer(store).accessToken();
  if (token == null) {
    return applyCookies(new NextResponse(null, { status: 204 }));
  }

  return applyCookies(
    NextResponse.json({
      value: token.value,
      expiresAt: token.expiresAt.toISOString(),
    }),
  );
}
