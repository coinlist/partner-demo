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

/** Remembers, in this browser only, which wallet it asked a challenge for. */
export function rememberChallenge(
  response: NextResponse,
  { walletAddress, chain }: ChallengedWallet
): NextResponse {
  response.cookies.set(
    CHALLENGE_COOKIE,
    JSON.stringify({ walletAddress: walletAddress.toLowerCase(), chain }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // Strict, so a cross-site post to the complete route arrives without it.
      sameSite: 'strict',
      path: '/api/coinlist/wallet',
      maxAge: CHALLENGE_TTL_SECONDS,
    }
  );
  return response;
}

/**
 * Whether the grant comes from this site, and from the browser that asked for
 * a challenge for this same wallet and chain.
 */
export function isFromChallengingBrowser(
  request: NextRequest,
  { walletAddress, chain }: ChallengedWallet
): boolean {
  if (request.headers.get('origin') !== SITE_ORIGIN) return false;
  const raw = request.cookies.get(CHALLENGE_COOKIE)?.value;
  if (!raw) return false;
  try {
    const challenged = JSON.parse(raw) as Partial<ChallengedWallet>;
    return (
      challenged.walletAddress === walletAddress.toLowerCase() &&
      challenged.chain === chain
    );
  } catch {
    return false;
  }
}

export function forgetChallenge(response: NextResponse): NextResponse {
  response.cookies.delete({
    name: CHALLENGE_COOKIE,
    path: '/api/coinlist/wallet',
  });
  return response;
}
