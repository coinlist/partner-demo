'use client';

import { usePassage } from '@passage-cl/react';
import { shortenAddress } from '@passage-cl/react/universal';
import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useWalletSignInViewModel } from '@/features/wallet-sign-in/useWalletSignInViewModel';
import { WalletSignInButton } from '@/features/wallet-sign-in/WalletSignInButton';
import { useEvmWallet } from '@/lib/evm-wallet';
import { useSignInMethod } from '@/lib/providers/SignInMethodProvider';
import { ROUTES } from '@/lib/routes';

const PILL =
  'inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800';

/** The header's right edge: who is signed in, or how to sign in. */
export function HeaderAccount() {
  const { authState } = usePassage();
  const offeredSignIn = useSignInMethod();
  const { disconnect } = useEvmWallet();

  switch (authState.type) {
    case 'logged-in': {
      const { signInMethod } = authState;
      if (signInMethod.method === 'coinlist') {
        return (
          <Link href={ROUTES.SETTINGS} className={PILL}>
            <Settings size={16} />
            Settings
          </Link>
        );
      }
      return (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
            {shortenAddress(signInMethod.wallet.address)}
          </span>
          {/* The SDK ends a wallet session when its wallet disconnects, and
              then signs out through the provider's walletSignIn.signOut. */}
          <button
            type="button"
            onClick={() => void disconnect()}
            className={PILL}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      );
    }
    case 'logged-out':
      return offeredSignIn === 'wallet' ? (
        <HeaderWalletSignIn />
      ) : (
        <Link href={ROUTES.ROOT} className={PILL}>
          Log in
        </Link>
      );
    case 'unknown':
      return null;
  }
}

function HeaderWalletSignIn() {
  const { state, onEvent } = useWalletSignInViewModel();
  return (
    <WalletSignInButton state={state} onEvent={onEvent} className={PILL} />
  );
}
