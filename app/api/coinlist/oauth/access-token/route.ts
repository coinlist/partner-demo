import { coinListServer } from "@/lib/coinlist-server";
import { createRouteHandlerCookiesStore } from "@/lib/session-store";
import { NextResponse } from "next/server";

export async function GET() {
  const { store, applyCookies } = createRouteHandlerCookiesStore();
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
