import 'server-only';

import type { EthereumChain } from '@passage-cl/react/universal';
import type { NextRequest, NextResponse } from 'next/server';
import { coinlistEnv } from '@/lib/coinlistEnv';

// Nothing in a signed grant says which browser asked for its challenge. Without
// this binding, a page on another site could post a grant its owner signed for
// their own wallet and sign the visitor into that wallet's session.
const CHALLENGE_COOKIE = 'coinlist_wallet_challenge';
const SITE_ORIGIN = new URL(coinlistEnv.redirectUri).origin;
// Frontline's challenge lives 10 minutes.
const CHALLENGE_TTL_SECONDS = 10 * 60;

type ChallengedWallet = { walletAddress: string; chain: EthereumChain };

function challengeCookieValue({
  walletAddress,
  chain,
}: ChallengedWallet): string {
  return JSON.stringify({ walletAddress: walletAddress.toLowerCase(), chain });
}

/** Remembers, in this browser only, which wallet it asked a challenge for. */
export function rememberChallenge(
  response: NextResponse,
  wallet: ChallengedWallet
): NextResponse {
  response.cookies.set(CHALLENGE_COOKIE, challengeCookieValue(wallet), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // Strict, so a cross-site post to the complete route arrives without it.
    sameSite: 'strict',
    path: '/api/coinlist/wallet',
    maxAge: CHALLENGE_TTL_SECONDS,
  });
  return response;
}

/**
 * Whether the grant comes from this site, and from the browser that asked for
 * a challenge for this same wallet and chain.
 */
export function isFromChallengingBrowser(
  request: NextRequest,
  wallet: ChallengedWallet
): boolean {
  return (
    request.headers.get('origin') === SITE_ORIGIN &&
    request.cookies.get(CHALLENGE_COOKIE)?.value ===
      challengeCookieValue(wallet)
  );
}

export function forgetChallenge(response: NextResponse): NextResponse {
  response.cookies.delete({
    name: CHALLENGE_COOKIE,
    path: '/api/coinlist/wallet',
  });
  return response;
}
