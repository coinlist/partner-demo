"use client";

export function OfferBanner({
  name,
  bannerUrl,
}: {
  name: string;
  bannerUrl: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900 shadow-sm">
      {bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bannerUrl} alt={name} className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 items-center justify-center bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900">
          <p className="text-xl font-semibold text-zinc-100">{name}</p>
        </div>
      )}
    </div>
  );
}
