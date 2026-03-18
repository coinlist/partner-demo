import { getCoinListServer } from "@/lib/coinlist-server";
import { NextResponse } from "next/server";

export async function GET() {
  const token = await getCoinListServer().accessToken();
  if (token == null) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({
    value: token.value,
    expiresAt: token.expiresAt.toISOString(),
  });
}
