import { type NextRequest, NextResponse } from 'next/server';
import { passageServer } from '@/lib/passage-server';
import { cookiesSessionStore } from '@/lib/session-store';

export async function GET(request: NextRequest) {
  const { store, applyCookies } = cookiesSessionStore(request);
  const token = await passageServer(store).auth.getAccessToken();
  if (token == null) {
    return applyCookies(new NextResponse(null, { status: 204 }));
  }

  return applyCookies(
    NextResponse.json({
      value: token.value,
      expiresAt: token.expiresAt.toISOString(),
    })
  );
}
