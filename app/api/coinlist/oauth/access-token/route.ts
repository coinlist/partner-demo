import { getCoinListServer as coinListServer } from "@/lib/coinlist-server";
import { copyCookiesFromTo } from "@/lib/session-store";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieSink = new NextResponse(null, { status: 204 });
  const token = await coinListServer(cookieSink).accessToken();
  if (token == null) {
    return cookieSink;
  }

  const response = NextResponse.json({
    value: token.value,
    expiresAt: token.expiresAt.toISOString(),
  });
  copyCookiesFromTo(cookieSink, response);
  return response;
}
