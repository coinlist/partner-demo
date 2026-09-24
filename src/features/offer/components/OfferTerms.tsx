'use client';

type OfferTerm = {
  key: string;
  value: string;
};

export function OfferTerms({
  terms,
  layout,
}: {
  terms: OfferTerm[];
  layout: 'rows' | 'grid';
}) {
  if (layout === 'rows') {
    return (
      <dl className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {terms.map((term) => (
          <div
            key={term.key}
            className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-10"
          >
            <dt className="text-sm text-zinc-500 dark:text-zinc-400">
              {term.key}
            </dt>
            <dd className="min-w-0 whitespace-pre-line break-words text-sm leading-6 text-zinc-900 dark:text-zinc-100">
              {term.value}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
      {terms.map((term) => (
        <div
          key={term.key}
          className="flex items-baseline justify-between gap-4"
        >
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">
            {term.key}
          </dt>
          <dd className="min-w-0 break-words text-right text-sm text-zinc-900 dark:text-zinc-100">
            {term.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
