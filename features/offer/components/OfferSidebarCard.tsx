"use client";

export function OfferSidebarCard({
  statusText,
  tokenCode,
  tokenPriceUsd,
}: {
  statusText: string;
  tokenCode: string;
  tokenPriceUsd: number | null;
}) {
  const tokenPriceDisplay =
    typeof tokenPriceUsd === "number" && Number.isFinite(tokenPriceUsd)
      ? `$${tokenPriceUsd.toFixed(2)}`
      : "--";

  return (
    <aside className="top-6 space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-sky-50 to-indigo-50 px-5 py-4 text-center shadow-sm dark:border-zinc-700 dark:from-sky-950/40 dark:to-indigo-950/40 dark:shadow-none">
        <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {statusText}
        </p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {tokenCode}
          </p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {tokenPriceDisplay}
          </p>
        </div>
      </div>
    </aside>
  );
}
