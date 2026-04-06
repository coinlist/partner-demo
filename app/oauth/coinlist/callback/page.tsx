"use client";

import {
  CompleteCoinListOAuthFailureReason,
  useCompleteCoinListOAuth,
} from "@coinlist-co/react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

export default function CoinListCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Completing sign-in…</p>
        </div>
      }
    >
      <CoinListCallbackContent />
    </Suspense>
  );
}

function CoinListCallbackContent() {
  const router = useRouter();

  useCompleteCoinListOAuth({
    postOAuthComplete: async (payload) => {
      const complete = await fetch("/api/coinlist/oauth/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: payload.code,
          codeVerifier: payload.codeVerifier,
        }),
      });
      return complete.ok;
    },
    onFailure: (reason: CompleteCoinListOAuthFailureReason) => {
      router.replace(`/?error=${reason}`);
    },
    onSuccess: () => {
      router.replace("/");
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Completing sign-in…</p>
    </div>
  );
}
