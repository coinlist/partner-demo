'use client';

import Image from 'next/image';

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
        <div className="relative h-40 w-full">
          <Image
            src={bannerUrl}
            alt={name}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
          <p className="text-xl font-semibold text-zinc-700 dark:text-zinc-100">
            {name}
          </p>
        </div>
      )}
    </div>
  );
}
