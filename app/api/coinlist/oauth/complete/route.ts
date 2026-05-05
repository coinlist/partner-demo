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

  const response = NextResponse.json({ ok: true });

  // The CoinList SDK will set the OAuth session cookie
  // via the SessionStore impl that you provided
  await coinListServer(response).completeOAuth(
    AuthorizationCode(code),
    CodeVerifier(codeVerifier),
  );

  return response;
}
