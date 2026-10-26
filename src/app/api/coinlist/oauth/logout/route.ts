import { type NextRequest, NextResponse } from 'next/server';
import { passageServer } from '@/lib/passage-server';
import { cookiesSessionStore } from '@/lib/session-store';

export async function POST(request: NextRequest) {
  const { store, applyCookies } = cookiesSessionStore(request);
  await passageServer(store).auth.logout();
  return applyCookies(NextResponse.json({ ok: true }));
}
