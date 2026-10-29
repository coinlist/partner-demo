'use client';

import { CoinListSignInCardContainer } from '@passage-cl/react';
import Link from 'next/link';
import { ErrorBanner } from '@/components/ErrorBanner';
import type { LoginUiState } from '@/features/login/useLoginViewModel';
import { ROUTES } from '@/lib/routes';

export interface Props {
  state: LoginUiState;
}

export function LoginView({ state }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-16 font-sans dark:bg-black">
      <div className="flex w-full max-w-md flex-col gap-4">
        {state.oauthError && <ErrorBanner message={state.oauthError} />}
        <CoinListSignInCardContainer />
        <Link
          href={ROUTES.ADDRESS}
          className="text-center text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          Trade Ondo assets with only a wallet
        </Link>
      </div>
    </div>
  );
}
