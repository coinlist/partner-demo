import { type NextRequest, NextResponse } from 'next/server';
import { passageServer } from '@/lib/passage-server';
import { cookiesSessionStore } from '@/lib/session-store';

export const config = {
  // Excludes:
  //   api           — all API routes
  //   _next/static  — Next.js bundled assets
  //   _next/image   — Next.js image optimization
  //   favicon.ico
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export async function proxy(request: NextRequest) {
  const { store, applyCookies } = cookiesSessionStore(request);
  try {
    await passageServer(store).auth.getAccessToken();
  } catch {
    return NextResponse.next(); // degrade gracefully
  }
  return applyCookies(NextResponse.next());
}
