import 'server-only';

import type { NextRequest } from 'next/server';

const RATE_LIMIT = { requests: 10, windowMs: 60_000 };

// The counters live in this process, so a deployment with several instances
// counts per instance; a partner running more than one would move them to a
// shared store.
const windows = new Map<string, { start: number; count: number }>();
let lastSweep = 0;

/** Counts one request from the visitor and says whether it is over the limit. */
export function isRateLimited(request: NextRequest): boolean {
  const key = clientIp(request);
  const now = Date.now();
  if (windows.size > 10_000 && now - lastSweep >= RATE_LIMIT.windowMs) {
    lastSweep = now;
    for (const [ip, { start }] of windows) {
      if (now - start >= RATE_LIMIT.windowMs) windows.delete(ip);
    }
  }
  const window = windows.get(key);
  if (!window || now - window.start >= RATE_LIMIT.windowMs) {
    windows.set(key, { start: now, count: 1 });
    return false;
  }
  window.count += 1;
  return window.count > RATE_LIMIT.requests;
}

// Trust this header only behind a proxy that overwrites it, as Vercel does.
// Served directly, a client can send any value and get a new window each time.
function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  );
}
