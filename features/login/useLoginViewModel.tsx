"use client";

import { useSearchParams } from "next/navigation";

export type LoginUiState = {
  oauthError: string | null;
};

export function useLoginViewModel(): {
  state: LoginUiState;
} {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");

  const uiState: LoginUiState = {
    oauthError: errorCode,
  };
  return {
    state: uiState,
  };
}
