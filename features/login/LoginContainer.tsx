"use client";

import { LoginView } from "./LoginView";
import { useLoginViewModel } from "./useLoginViewModel";

export function LoginContainer() {
  const { state } = useLoginViewModel();
  return <LoginView state={state} />;
}
