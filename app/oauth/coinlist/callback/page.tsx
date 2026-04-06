"use client";

import {
  CompleteCoinListOAuthFailureReason,
  useCompleteCoinListOAuth,
} from "@coinlist-co/react";
import { useRouter } from "next/navigation";

export default function CoinListCallbackPage() {
  const router = useRouter();

  useCompleteCoinListOAuth({
    async postOAuthComplete({ code, codeVerifier }) {
      const res = await fetch("/api/coinlist/oauth/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code, codeVerifier }),
      });
      return res.ok;
    },
    onFailure(reason: CompleteCoinListOAuthFailureReason) {
      router.replace(`/?error=${encodeURIComponent(reason)}`);
    },
    onSuccess() {
      router.replace("/");
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Completing sign-in…</p>
    </div>
  );
}
