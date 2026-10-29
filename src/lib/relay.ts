import 'server-only';

import { emptySessionStore } from '@passage-cl/react/server';
import type { ClientCredentialsOAuth } from '@passage-cl/react/universal';
import type { NextRequest } from 'next/server';
import { coinlistEnv } from '@/lib/coinlistEnv';
import { passageServer } from '@/lib/passage-server';

/**
 * The reference relay for a caller with no CoinList user: the browser calls
 * this server on CoinList's own path, and the relay forwards the call with the
 * partner's `client_credentials` token, which never leaves the server.
 *
 * Every relayed call acts as the partner, so the relay is an open proxy for
 * the partner's token unless it forwards only the calls the SDK makes for an
 * address-only caller. Anything off this list is a 404 and never reaches
 * CoinList.
 */
const ROUTES: { method: string; path: RegExp; rateLimited: boolean }[] = [
  {
    method: 'GET',
    path: /^\/v1\/ondo\/swap\/trading-status$/,
    rateLimited: false,
  },
  { method: 'GET', path: /^\/v1\/ondo\/swap\/quote$/, rateLimited: false },
  { method: 'POST', path: /^\/v1\/ondo\/swap\/buy$/, rateLimited: true },
  { method: 'POST', path: /^\/v1\/ondo\/swap\/sell$/, rateLimited: true },
  {
    method: 'GET',
    path: /^\/v1\/offers\/[\w-]+\/requirements$/,
    rateLimited: false,
  },
];

/**
 * The only request headers forwarded. Building the outgoing headers from a
 * list, rather than copying and deleting, is what strips the caller's
 * `Authorization` and cookies, and anything else added later.
 */
const FORWARDED_HEADERS = [
  'accept',
  'content-type',
  'x-api-version',
  'idempotency-key',
];

const API_BASE_URL = coinlistEnv.apiBaseUrl ?? 'https://api.coinlist.co';
const MAX_BODY_BYTES = 16 * 1024;
const UPSTREAM_TIMEOUT_MS = 15_000;
const TOKEN_REFRESH_MARGIN_MS = 60_000;
const RATE_LIMIT = { requests: 10, windowMs: 60_000 };

export async function relay(
  request: NextRequest,
  path: string
): Promise<Response> {
  const route = ROUTES.find(
    (r) => r.method === request.method && r.path.test(path)
  );
  if (!route) return status(404);

  if (route.rateLimited && isRateLimited(clientIp(request))) return status(429);

  const body =
    request.method === 'POST' ? await readCappedBody(request) : undefined;
  if (body === null) return status(413);

  const headers = new Headers();
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  headers.set('authorization', `Bearer ${(await partnerToken()).value}`);

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}${path}${request.nextUrl.search}`, {
      method: request.method,
      headers,
      body,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (err) {
    return status(
      err instanceof DOMException && err.name === 'TimeoutError' ? 504 : 502
    );
  }

  // CoinList's status and body pass through unchanged, so the SDK reads a
  // refusal the same way it would from CoinList directly.
  const contentType = upstream.headers.get('content-type');
  return new Response(upstream.body, {
    status: upstream.status,
    headers: contentType ? { 'content-type': contentType } : {},
  });
}

function status(code: number): Response {
  return new Response(null, { status: code });
}

/** The body, or `null` once it passes the cap, read no further than that. */
async function readCappedBody(request: NextRequest): Promise<Blob | null> {
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES)
    return null;
  if (!request.body) return new Blob();

  const reader = request.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let size = 0;
  for (let read = await reader.read(); !read.done; read = await reader.read()) {
    size += read.value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(read.value);
  }
  return new Blob(chunks);
}

// Token cache and rate-limit counters live in this process. A deployment with
// several instances gets one token and one counter per instance; a partner
// running more than one would move both to a shared store.

let token: ClientCredentialsOAuth | null = null;
let tokenRequest: Promise<ClientCredentialsOAuth> | null = null;

export async function partnerToken(): Promise<ClientCredentialsOAuth> {
  if (
    token &&
    token.expiresAt.getTime() - Date.now() > TOKEN_REFRESH_MARGIN_MS
  ) {
    return token;
  }
  // Concurrent calls share one exchange rather than each minting a token.
  tokenRequest ??= passageServer(emptySessionStore())
    .auth.clientCredentials()
    .then((fresh) => {
      token = fresh;
      return fresh;
    })
    .finally(() => {
      tokenRequest = null;
    });
  return tokenRequest;
}

const windows = new Map<string, { start: number; count: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (windows.size > 10_000) {
    for (const [key, { start }] of windows) {
      if (now - start >= RATE_LIMIT.windowMs) windows.delete(key);
    }
  }
  const window = windows.get(ip);
  if (!window || now - window.start >= RATE_LIMIT.windowMs) {
    windows.set(ip, { start: now, count: 1 });
    return false;
  }
  window.count += 1;
  return window.count > RATE_LIMIT.requests;
}

/**
 * The first `X-Forwarded-For` entry, which the hosting proxy sets. Without a
 * proxy in front that overwrites it, the caller picks its own IP.
 */
function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  );
}
