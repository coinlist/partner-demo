"use client";

import {
  CompleteOAuthFailureReason,
  useCompleteOAuth,
} from "@coinlist-co/react";
import { useRouter } from "next/navigation";

export default function CoinListCallbackPage() {
  const router = useRouter();

  useCompleteOAuth({
    async postOAuthComplete({ code, codeVerifier }) {
      const res = await fetch("/api/coinlist/oauth/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code, codeVerifier }),
      });
      return res.ok;
    },
    onFailure(reason: CompleteOAuthFailureReason) {
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
