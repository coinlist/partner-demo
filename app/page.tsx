"use client";

import { useCoinList } from "@coinlist-co/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { HomeView } from "@/features/home/HomeView";
import { LoginView } from "@/features/login/LoginView";

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
    return <LoginView />;
  }

  return (
    <HomeView
      loggingOut={loggingOut}
      logoutError={logoutError}
      onLogout={onLogout}
    />
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
