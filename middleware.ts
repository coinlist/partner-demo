import { NextRequest, NextResponse } from "next/server";
import { coinListServer } from "@/lib/coinlist-server";
import { cookiesSessionStore } from "@/lib/session-store";

// Paths the middleware should NOT run on.
// Add new paths here to opt them out of session renewal.
const EXCLUDED_PATHS = [
  "_next/static", // Next.js bundled assets
  "_next/image", // Next.js image optimization
  "favicon.ico",
  "api/coinlist/oauth/access-token", // handled by the route itself; middleware would double-refresh
];

export const config = {
  matcher: [`/((?!${EXCLUDED_PATHS.join("|")}).*)`],
};

export async function middleware(request: NextRequest) {
  const { store, applyCookies } = cookiesSessionStore(request);
  try {
    await coinListServer(store).accessToken();
  } catch {
    return NextResponse.next(); // degrade gracefully
  }
  return applyCookies(NextResponse.next());
}
