'use client';

import Image from 'next/image';
import { OfferLink } from '@/features/offer/components/OfferLink';
import { OfferTerms } from '@/features/offer/components/OfferTerms';
import type {
  OfferUiLink,
  OfferUiTerm,
} from '@/features/offer/useOfferViewModel';

export function OfferDetailsCard({
  name,
  symbol,
  tagline,
  logoUrl,
  about,
  terms,
  links,
  isTokenSale,
}: {
  name: string;
  symbol: string;
  tagline: string | null;
  logoUrl: string | null;
  about: string | null;
  terms: OfferUiTerm[];
  links: OfferUiLink[];
  isTokenSale: boolean;
}) {
  const ticker =
    symbol && symbol.toLowerCase() !== name.toLowerCase() ? symbol : null;
  const description =
    about ??
    (tagline && tagline.toLowerCase() !== name.toLowerCase() ? tagline : null);

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <div className="flex min-w-0 items-center gap-4">
        <OfferLogo name={name} logoUrl={logoUrl} size={56} />
        <div className="min-w-0">
          <h1 className="truncate text-[28px] font-medium leading-[120%] text-zinc-900 dark:text-zinc-100">
            {name}
          </h1>
          {ticker ? (
            <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
              {ticker}
            </p>
          ) : null}
        </div>
      </div>

      {terms.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {isTokenSale ? 'Sale Terms' : 'Asset details'}
          </h2>
          <OfferTerms terms={terms} layout={isTokenSale ? 'rows' : 'grid'} />
        </section>
      ) : null}

      {description || links.length > 0 ? (
        <>
          {terms.length > 0 ? <SectionDivider /> : null}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              About {name}
            </h2>
            {description ? (
              <p className="whitespace-pre-line text-[16px] leading-[160%] text-zinc-600 dark:text-zinc-300">
                {description}
              </p>
            ) : null}
            {links.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {links.map((link) => (
                  <OfferLink key={link.label + link.url} link={link} />
                ))}
              </div>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}

export function SectionDivider() {
  return <div className="h-px bg-zinc-200 dark:bg-zinc-800" />;
}

function OfferLogo({
  name,
  logoUrl,
  size,
}: {
  name: string;
  logoUrl: string | null;
  size: number;
}) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
      style={{ width: size, height: size }}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-contain"
        />
      ) : (
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-300">
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </div>
  );
}
