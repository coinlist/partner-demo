'use client';

import type { OfferLogoUi } from '@coinlist-co/react';
import Image from 'next/image';

export function OfferHeader({
  name,
  tagline,
  logo,
}: {
  name: string;
  tagline: string | null;
  /** The SDK's logo model: `light.src` is what `next/image` takes. */
  logo: OfferLogoUi | null;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
        {logo ? (
          <>
            <Image
              src={logo.light.src}
              alt={name}
              fill
              sizes="48px"
              className={
                logo.dark ? 'object-cover dark:hidden' : 'object-cover'
              }
            />
            {/* The registry's dark-theme logo, when it configures one. The
                demo's dark theme follows the system setting, as Tailwind's
                `dark:` does. */}
            {logo.dark ? (
              <Image
                src={logo.dark.src}
                alt={name}
                fill
                sizes="48px"
                className="hidden object-cover dark:block"
              />
            ) : null}
          </>
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
