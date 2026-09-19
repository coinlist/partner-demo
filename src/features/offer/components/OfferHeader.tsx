'use client';

import type { OfferUiLogo } from '@/features/offer/useOfferViewModel';

// The logo renders at 48px (`h-12 w-12`); `sizes` lets the browser pick the
// variant from `srcSet` that covers it at the screen's pixel density.
const LOGO_SIZES = '48px';

export function OfferHeader({
  name,
  tagline,
  logo,
}: {
  name: string;
  tagline: string | null;
  logo: OfferUiLogo | null;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
        {logo ? (
          <picture>
            {/* The demo's dark theme follows the system setting. */}
            {logo.dark ? (
              <source
                media="(prefers-color-scheme: dark)"
                srcSet={logo.dark.srcSet ?? logo.dark.src}
                sizes={LOGO_SIZES}
              />
            ) : null}
            <img
              src={logo.light.src}
              srcSet={logo.light.srcSet}
              sizes={LOGO_SIZES}
              alt={name}
              className="h-12 w-12 object-cover"
            />
          </picture>
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
