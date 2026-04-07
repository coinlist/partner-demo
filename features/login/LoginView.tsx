"use client";

import { CoinListSignInCard } from "@coinlist-co/react/client/components";
import { LoginUiState } from "./useLoginViewModel";
import { ErrorBanner } from "@/components/ErrorBanner";

export interface Props {
  state: LoginUiState;
}

export function LoginView({ state }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <div className="flex w-full max-w-md flex-col gap-4">
        {state.oauthError && <ErrorBanner message={state.oauthError} />}
        <CoinListSignInCard />
      </div>
    </div>
  );
}
