import { getCoinListServer } from "@/lib/coinlist-server";
import { mergeResponseCookies } from "@/lib/session-store";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieSink = new NextResponse(null, { status: 204 });
  const token = await getCoinListServer(cookieSink).accessToken();
  if (token == null) {
    return cookieSink;
  }

  const res = NextResponse.json({
    value: token.value,
    expiresAt: token.expiresAt.toISOString(),
  });
  mergeResponseCookies(cookieSink, res);
  return res;
}
