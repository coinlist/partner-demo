"use client";

export function OfferBanner({
  name,
  bannerUrl,
}: {
  name: string;
  bannerUrl: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900">
      {bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bannerUrl} alt={name} className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 items-center justify-center bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
          <p className="text-xl font-semibold text-zinc-700 dark:text-zinc-100">{name}</p>
        </div>
      )}
    </div>
  );
}
