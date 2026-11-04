import { EvmWalletAddress } from '@passage-cl/react/universal';
import { type NextRequest, NextResponse } from 'next/server';
import { isHex } from 'viem';
import { isEthereumChain } from '@/lib/chain';
import { passageServer } from '@/lib/passage-server';
import { cookiesSessionStore } from '@/lib/session-store';
import {
  forgetChallenge,
  isFromChallengingBrowser,
} from '@/lib/wallet-challenge-binding';

export async function POST(request: NextRequest) {
  const body: {
    walletAddress?: unknown;
    chain?: unknown;
    signature?: unknown;
  } = await request.json().catch(() => ({}));
  if (
    typeof body.walletAddress !== 'string' ||
    !isEthereumChain(body.chain) ||
    !isHex(body.signature, { strict: false })
  ) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  const wallet = { walletAddress: body.walletAddress, chain: body.chain };
  if (!isFromChallengingBrowser(request, wallet)) {
    return NextResponse.json({ error: 'challenge_not_found' }, { status: 403 });
  }

  const { store, applyCookies } = cookiesSessionStore(request);
  await passageServer(store).auth.completeWalletSignIn({
    walletAddress: EvmWalletAddress(wallet.walletAddress),
    chain: wallet.chain,
    signature: body.signature,
  });

  return forgetChallenge(applyCookies(NextResponse.json({ ok: true })));
}
