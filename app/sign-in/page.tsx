"use client";

import { CoinListSignInCard } from "coinlist-react/client/components";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const errorDisplay = errorCode ? decodeURIComponent(errorCode) : null;

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
        <CoinListSignInCard />
      </main>
    </div>
  );
}
