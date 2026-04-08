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
  return (
    <aside className="sticky top-6 space-y-4">
      <div className="rounded-2xl border border-zinc-700 bg-gradient-to-r from-sky-950/40 to-indigo-950/40 px-5 py-4 text-center">
        <p className="text-base font-semibold text-zinc-100">{statusText}</p>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-300">{tokenCode}</p>
          <p className="text-sm font-semibold text-zinc-100">
            {tokenPriceUsd === null ? "--" : `$${tokenPriceUsd.toFixed(2)}`}
          </p>
        </div>
      </div>
    </aside>
  );
}
