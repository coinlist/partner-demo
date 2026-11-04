'use client';

import { CoinListSignInCardContainer } from '@passage-cl/react';
import { PRIMARY_BUTTON } from '@/components/buttons';
import { ErrorBanner } from '@/components/ErrorBanner';
import type { LoginUiState } from '@/features/login/useLoginViewModel';
import type {
  WalletSignInUiEvent,
  WalletSignInUiState,
} from '@/features/wallet-sign-in/useWalletSignInViewModel';
import { WalletSignInButton } from '@/features/wallet-sign-in/WalletSignInButton';

export interface Props {
  state: LoginUiState;
  walletSignIn: {
    state: WalletSignInUiState;
    onEvent: (event: WalletSignInUiEvent) => void;
  };
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
          className={PRIMARY_BUTTON}
        />
      </div>
    </div>
  );
}
