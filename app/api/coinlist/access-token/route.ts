import { NextResponse } from "next/server";

import { coinlistServer } from "@/lib/coinlist-server";

export async function GET() {
  const token = await coinlistServer.accessToken();
  if (token == null) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({
    value: token.value,
    expiresAt: token.expiresAt.toISOString(),
  });
}

