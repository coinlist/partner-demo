"use client";

import { CoinListSignInCard } from "coinlist-react/client/components";
import { useCoinList } from "coinlist-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
          <main className="w-full max-w-md">
            <ShimmerLoader />
          </main>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const errorDisplay = errorCode ? decodeURIComponent(errorCode) : null;

  const { isReady, coinlist } = useCoinList();
  const authState = isReady ? coinlist.getAuthState() : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-md space-y-4">
        {errorDisplay ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
          >
            {errorDisplay}
          </p>
        ) : null}
        {!isReady || authState === "unknown" ? (
          <ShimmerLoader />
        ) : authState === "logged-out" ? (
          <CoinListSignInCard />
        ) : (
          <p className="text-center text-base text-zinc-800 dark:text-zinc-200">
            You are logged in. 🎉
          </p>
        )}
      </main>
    </div>
  );
}

function ShimmerLoader() {
  return (
    <div className="w-full space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-10 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-52 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-10 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
