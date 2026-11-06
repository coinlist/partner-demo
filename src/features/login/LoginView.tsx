'use client';

import { CoinListSignInCardContainer } from '@passage-cl/react';
import { ErrorBanner } from '@/components/ErrorBanner';
import type { LoginUiState } from '@/features/login/useLoginViewModel';
import type { WalletSignInViewModel } from '@/features/wallet-sign-in/useWalletSignInViewModel';
import { WalletSignInButton } from '@/features/wallet-sign-in/WalletSignInButton';

export interface Props {
  state: LoginUiState;
  walletSignIn: WalletSignInViewModel;
}

export function LoginView({ state, walletSignIn }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-16 font-sans dark:bg-black">
      <div className="flex w-full max-w-md flex-col gap-4">
        {state.oauthError && <ErrorBanner message={state.oauthError} />}
        <CoinListSignInCardContainer />
        <WalletSignInButton
          state={walletSignIn.state}
          onEvent={walletSignIn.onEvent}
          className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        />
      </div>
    </div>
  );
}
