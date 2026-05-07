import { NextRequest, NextResponse } from "next/server";
import { coinListServer } from "@/lib/coinlist-server";
import { cookiesSessionStore } from "@/lib/session-store";

export const config = {
  // Excludes:
  //   _next/static  — Next.js bundled assets
  //   _next/image   — Next.js image optimization
  //   favicon.ico
  //   api/coinlist/oauth/access-token — has its own token logic; running here too would double-refresh
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/coinlist/oauth/access-token).*)"],
};

export async function proxy(request: NextRequest) {
  const { store, applyCookies } = cookiesSessionStore(request);
  try {
    await coinListServer(store).accessToken();
  } catch {
    return NextResponse.next(); // degrade gracefully
  }
  return applyCookies(NextResponse.next());
}
