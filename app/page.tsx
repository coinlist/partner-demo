"use client";

import { CoinListSignInCard } from "coinlist-react/client/components";
import { useCoinList } from "coinlist-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

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
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      const res = await fetch("/api/coinlist/oauth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("logout failed");
      coinlist.logout();
    } catch {
      setLogoutError("Could not sign out. Try again.");
    } finally {
      setLoggingOut(false);
    }
  }

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
          <div className="flex flex-col items-center gap-4">
            <p className="text-center text-base text-zinc-800 dark:text-zinc-200">
              You are logged in. 🎉
            </p>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
            {logoutError ? (
              <p
                role="alert"
                className="text-center text-sm text-red-600 dark:text-red-400"
              >
                {logoutError}
              </p>
            ) : null}
          </div>
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
