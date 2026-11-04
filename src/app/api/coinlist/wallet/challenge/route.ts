import { emptySessionStore } from '@passage-cl/react/server';
import { EvmWalletAddress } from '@passage-cl/react/universal';
import { type NextRequest, NextResponse } from 'next/server';
import { isEthereumChain } from '@/lib/chain';
import { passageServer } from '@/lib/passage-server';
import { isRateLimited } from '@/lib/rate-limit';
import { rememberChallenge } from '@/lib/wallet-challenge-binding';

// The SDK signs the challenge for the configured redirect URI and its host.
// EIP-4361 allows only RFC 3986 reserved and unreserved characters and spaces.
const SIWE_STATEMENT = 'Sign in to the Passage demo with your wallet.';

export async function POST(request: NextRequest) {
  // The one route a visitor with no session can call, and each call makes
  // CoinList store a challenge.
  if (isRateLimited(request)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const body: { walletAddress?: unknown; chain?: unknown } = await request
    .json()
    .catch(() => ({}));
  if (typeof body.walletAddress !== 'string' || !isEthereumChain(body.chain)) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const { message } = await passageServer(
    emptySessionStore()
  ).auth.walletChallenge({
    walletAddress: EvmWalletAddress(body.walletAddress),
    chain: body.chain,
    statement: SIWE_STATEMENT,
  });
  return rememberChallenge(NextResponse.json({ message }), {
    walletAddress: body.walletAddress,
    chain: body.chain,
  });
}
