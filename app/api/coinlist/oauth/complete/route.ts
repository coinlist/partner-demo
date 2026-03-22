import { NextResponse } from "next/server";
import { AuthorizationCode, CodeVerifier } from "coinlist-react/server";

import { getCoinListServer } from "@/lib/coinlist-server";

const LOG_PREFIX = "[coinlist/oauth/complete]";

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

  try {
    await getCoinListServer().completeOAuth(
      AuthorizationCode(code),
      CodeVerifier(codeVerifier),
    );
  } catch (err) {
    console.error(LOG_PREFIX, "completeOAuth threw", err);
    if (
      err &&
      typeof err === "object" &&
      "response" in err &&
      err.response &&
      typeof err.response === "object"
    ) {
      const r = err.response as { status?: unknown; body?: unknown };
      console.error(LOG_PREFIX, "token HTTP response", {
        status: r.status,
        body: r.body,
      });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
