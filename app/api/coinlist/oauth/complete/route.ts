import { NextRequest, NextResponse } from "next/server";
import { AuthorizationCode, CodeVerifier } from "@coinlist-co/react/shared";
import { coinListServer } from "@/lib/coinlist-server";
import { cookiesSessionStore } from "@/lib/session-store";

interface CompleteOAuthRequest {
  code: string;
  codeVerifier: string;
}

export async function POST(request: NextRequest) {
  const body: CompleteOAuthRequest = await request.json();
  const code = body.code;
  const codeVerifier = body.codeVerifier;

  if (typeof code !== "string" || typeof codeVerifier !== "string") {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { store, applyCookies } = cookiesSessionStore(request);
  await coinListServer(store).completeOAuth(
    AuthorizationCode(code),
    CodeVerifier(codeVerifier),
  );

  return applyCookies(NextResponse.json({ ok: true }));
}
