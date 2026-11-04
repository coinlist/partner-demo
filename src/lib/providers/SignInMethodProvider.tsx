'use client';

import type { SignInMethod } from '@passage-cl/react/universal';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type OfferedSignIn = SignInMethod['method'];

const COINLIST_LOGIN: OfferedSignIn = 'coinlist';

const SignInMethodContext = createContext<{
  method: OfferedSignIn;
  setMethod: (method: OfferedSignIn) => void;
}>({ method: COINLIST_LOGIN, setMethod: () => {} });

/**
 * Which sign-in the header offers a signed-out visitor. The header sits in the
 * root layout and knows no offer, so the offer page sets it from the selected
 * option; every other page leaves the CoinList login.
 */
export function SignInMethodProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [method, setMethod] = useState<OfferedSignIn>(COINLIST_LOGIN);
  const value = useMemo(() => ({ method, setMethod }), [method]);
  return (
    <SignInMethodContext.Provider value={value}>
      {children}
    </SignInMethodContext.Provider>
  );
}

export function useSignInMethod(): OfferedSignIn {
  return useContext(SignInMethodContext).method;
}

/** Sets the header's sign-in for as long as the calling page is mounted. */
export function useOfferSignInMethod(method: OfferedSignIn): void {
  const { setMethod } = useContext(SignInMethodContext);
  useEffect(() => {
    setMethod(method);
    return () => setMethod(COINLIST_LOGIN);
  }, [method, setMethod]);
}
