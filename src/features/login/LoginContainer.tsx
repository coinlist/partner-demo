'use client';

import { Suspense } from 'react';
import { LoginView } from '@/features/login/LoginView';
import { useLoginViewModel } from '@/features/login/useLoginViewModel';
import { useWalletSignInViewModel } from '@/features/wallet-sign-in/useWalletSignInViewModel';

export function LoginContainer() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContainerContent />
    </Suspense>
  );
}

function LoginContainerContent() {
  const { state } = useLoginViewModel();
  const walletSignIn = useWalletSignInViewModel();
  return <LoginView state={state} walletSignIn={walletSignIn} />;
}

function LoginFallback() {
  return <div className="min-h-screen bg-white dark:bg-black" />;
}
