import { NextResponse } from "next/server";
import { AuthorizationCode, CodeVerifier } from "@coinlist-co/react/shared";
import { coinListServer } from "@/lib/coinlist-server";

interface CompleteOAuthRequest {
  code: string;
  codeVerifier: string;
}

export async function POST(req: Request) {
  const body: CompleteOAuthRequest = await req.json();
  const code = body.code;
  const codeVerifier = body.codeVerifier;

  if (typeof code !== "string" || typeof codeVerifier !== "string") {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  await coinListServer().completeOAuth(
    AuthorizationCode(code),
    CodeVerifier(codeVerifier),
  );

  return NextResponse.json({ ok: true });
}
