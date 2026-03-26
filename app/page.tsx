"use client";

import { CoinListSignInCard } from "@coinlist-co/react/client/components";
import { useCoinList } from "@coinlist-co/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <div className="w-full max-w-md">
            <ShimmerLoader />
          </div>
        </PageShell>
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
    <PageShell>
      <main className="w-full max-w-md space-y-4">
        <ErrorBanner message={errorDisplay} />
        <AuthStateSection
          isReady={isReady}
          authState={authState}
          loggingOut={loggingOut}
          logoutError={logoutError}
          onLogout={handleLogout}
        />
      </main>
    </PageShell>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      {children}
    </div>
  );
}

function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
    >
      {message}
    </p>
  );
}

function AuthStateSection({
  isReady,
  authState,
  loggingOut,
  logoutError,
  onLogout,
}: {
  isReady: boolean;
  authState: string | null;
  loggingOut: boolean;
  logoutError: string | null;
  onLogout: () => Promise<void>;
}) {
  if (!isReady || authState === "unknown") {
    return <ShimmerLoader />;
  }

  if (authState === "logged-out") {
    return <CoinListSignInCard />;
  }

  return (
    <LoggedInPanel
      loggingOut={loggingOut}
      logoutError={logoutError}
      onLogout={onLogout}
    />
  );
}

function LoggedInPanel({
  loggingOut,
  logoutError,
  onLogout,
}: {
  loggingOut: boolean;
  logoutError: string | null;
  onLogout: () => Promise<void>;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-base text-zinc-800 dark:text-zinc-200">
        You are logged in. 🎉
      </p>
      <button
        type="button"
        onClick={() => onLogout()}
        disabled={loggingOut}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        {loggingOut ? "Signing out…" : "Sign out"}
      </button>
      <InlineErrorText message={logoutError} />
    </div>
  );
}

function InlineErrorText({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="text-center text-sm text-red-600 dark:text-red-400"
    >
      {message}
    </p>
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
