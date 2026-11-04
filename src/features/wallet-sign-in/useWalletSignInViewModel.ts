'use client';

import { useWalletSignIn } from '@passage-cl/react';
import type { EvmWallet } from '@passage-cl/react/universal';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useEvmWallet } from '@/lib/evm-wallet';
import { useConnectedWallet } from '@/lib/wallet-connection';

export type WalletSignInUiState = {
  label: string;
  disabled: boolean;
  error: string | null;
};

export type WalletSignInUiEvent = { type: 'ON_SIGN_IN_CLICK' };

/**
 * One click from a disconnected visitor connects and then signs in: the
 * click opens AppKit, and the sign-in starts once the wallet arrives.
 */
export function useWalletSignInViewModel(): {
  state: WalletSignInUiState;
  onEvent: (event: WalletSignInUiEvent) => void;
} {
  const wallet = useConnectedWallet();
  const { connect } = useEvmWallet();
  const { state, signIn } = useWalletSignIn();
  const router = useRouter();
  const [awaitingWallet, setAwaitingWallet] = useState(false);

  const signInWith = useCallback(
    async (connected: EvmWallet) => {
      // The server components read the new session cookie only on a refresh.
      if ((await signIn(connected)).type === 'signed-in') {
        router.refresh();
      }
    },
    [signIn, router]
  );

  useEffect(() => {
    if (!(awaitingWallet && wallet)) return;
    setAwaitingWallet(false);
    void signInWith(wallet);
  }, [awaitingWallet, wallet, signInWith]);

  const onEvent = (event: WalletSignInUiEvent) => {
    switch (event.type) {
      case 'ON_SIGN_IN_CLICK':
        if (wallet) {
          void signInWith(wallet);
        } else {
          setAwaitingWallet(true);
          connect();
        }
        break;
    }
  };

  return {
    state: {
      label:
        state === 'pending' ? 'Check your wallet...' : 'Sign in with wallet',
      disabled: state === 'pending',
      error:
        state === 'failed'
          ? 'Could not sign in with your wallet. Try again.'
          : null,
    },
    onEvent,
  };
}
