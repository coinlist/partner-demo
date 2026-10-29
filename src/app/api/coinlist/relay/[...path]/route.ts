import type { NextRequest } from 'next/server';
import { relay } from '@/lib/relay';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return relay(request, `/${path.join('/')}`);
}

// Every method, so one off the allowlist gets the relay's 404 rather than
// Next's 405.
export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
