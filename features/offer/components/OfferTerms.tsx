'use client';

type OfferTerm = {
  key: string;
  value: string;
};

export function OfferTerms({ terms }: { terms: OfferTerm[] }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-none">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Sale Terms
      </h2>
      <div className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
        {terms.map((term) => (
          <div
            key={term.key}
            className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-2"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {term.key}
            </p>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {term.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
