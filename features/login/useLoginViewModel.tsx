"use client";

import { CompleteOAuthFailureReason } from "@coinlist-co/react";
import { useSearchParams } from "next/navigation";

export type LoginUiState = {
  oauthError: string | null;
};

export function useLoginViewModel(): {
  state: LoginUiState;
} {
  const searchParams = useSearchParams();
  const oauthFailure = parseOAuthFailureReason(searchParams.get("error"));

  const uiState: LoginUiState = {
    oauthError: oauthFailure ? getOAuthErrorMessage(oauthFailure) : null,
  };
  return {
    state: uiState,
  };
}

function parseOAuthFailureReason(
  value: string | null,
): CompleteOAuthFailureReason | null {
  if (!value) {
    return null;
  }

  return value as CompleteOAuthFailureReason;
}

function getOAuthErrorMessage(reason: CompleteOAuthFailureReason): string {
  switch (reason) {
    case "user_canceled":
      return "Sign-in was canceled before completion. Please try again.";
    case "missing_state":
    case "missing_code_verifier":
      return "Your sign-in session expired. Please start sign-in again.";
    case "invalid_state":
      return "We could not verify your sign-in request. Please try again.";
    case "missing_code":
      return "CoinList did not return an authorization code. Please try again.";
    case "complete_request_failed":
      return "We could not complete sign-in right now. Please try again.";
    default:
      return "Something went wrong while signing in. Please try again.";
  }
}
