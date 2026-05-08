'use client';

import Image from 'next/image';

export function OfferHeader({
  name,
  tagline,
  logoUrl,
}: {
  name: string;
  tagline: string | null;
  logoUrl: string | null;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
        {logoUrl ? (
          <Image src={logoUrl} alt={name} fill className="object-cover" />
        ) : (
          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-200">
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {name}
        </h1>
        {tagline ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{tagline}</p>
        ) : null}
      </div>
    </div>
  );
}
