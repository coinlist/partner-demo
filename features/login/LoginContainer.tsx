'use client';

import { Suspense } from 'react';
import { LoginView } from './LoginView';
import { useLoginViewModel } from './useLoginViewModel';

export function LoginContainer() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContainerContent />
    </Suspense>
  );
}

function LoginContainerContent() {
  const { state } = useLoginViewModel();
  return <LoginView state={state} />;
}

function LoginFallback() {
  return <div className="min-h-screen bg-white dark:bg-black" />;
}
