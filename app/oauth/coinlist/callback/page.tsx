"use client";

import { useCoinList } from "coinlist-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function CoinListCallbackContent() {
  const { coinlist } = useCoinList();
  const searchParams = useSearchParams();
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;

    if (searchParams.get("error")) {
      router.replace("/?error=coinlist_denied");
      return;
    }

    if (!searchParams.get("code")) return;

    const res = coinlist.completeOAuth();
    if (res.type === "error") {
      router.replace("/?error=coinlist_oauth");
      return;
    }

    done.current = true;
    void (async () => {
      const complete = await fetch("/api/coinlist/oauth/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: res.code,
          codeVerifier: res.codeVerifier,
        }),
      });

      if (!complete.ok) {
        done.current = false;
        router.replace("/?error=coinlist_complete_failed");
        return;
      }

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

