"use client";

import { useCoinList } from "coinlist-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function CoinListCallbackContent() {
  const { coinlist } = useCoinList();
  const searchParams = useSearchParams();
  const router = useRouter();
  // Prevent duplicate OAuth completion requests if this effect runs more than once.
  const hasStartedOAuthCompletion = useRef(false);

  useEffect(() => {
    if (hasStartedOAuthCompletion.current) return;

    if (searchParams.get("error")) {
      router.replace("/?error=coinlist_denied");
      return;
    }

    if (!searchParams.get("code")) return;

    const oauthRes = coinlist.completeOAuth();
    if (oauthRes.type === "error") {
      router.replace("/?error=coinlist_oauth");
      return;
    }

    hasStartedOAuthCompletion.current = true;

    void (async () => {
      const complete = await fetch("/api/coinlist/oauth/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: oauthRes.code,
          codeVerifier: oauthRes.codeVerifier,
        }),
      });

      if (!complete.ok) {
        hasStartedOAuthCompletion.current = false;
        router.replace("/?error=coinlist_complete_failed");
        return;
      }

      // Fetch a fresh access token
      await coinlist.init();
      router.replace("/");
    })();
  }, [coinlist, searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Completing sign-in…</p>
    </div>
  );
}

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
