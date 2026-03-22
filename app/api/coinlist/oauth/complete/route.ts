import { NextResponse } from "next/server";
import { AuthorizationCode, CodeVerifier } from "coinlist-react/server";

import { getCoinListServer } from "@/lib/coinlist-server";

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  const obj: Record<string, unknown> =
    typeof body === "object" && body != null
      ? (body as Record<string, unknown>)
      : {};
  const code = obj.code;
  const codeVerifier = obj.codeVerifier;

  if (typeof code !== "string" || typeof codeVerifier !== "string") {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  await getCoinListServer().completeOAuth(
    AuthorizationCode(code),
    CodeVerifier(codeVerifier),
  );

  return NextResponse.json({ ok: true });
}
