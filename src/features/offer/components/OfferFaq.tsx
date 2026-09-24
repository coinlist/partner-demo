'use client';

type OfferFaqItem = {
  question: string;
  answer: string;
};

export function OfferFaq({ faqs }: { faqs: OfferFaqItem[] }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        FAQ
      </h2>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {faqs.map((faq) => (
          <details key={faq.question} className="py-3">
            <summary className="cursor-pointer text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {faq.question}
            </summary>
            <p className="mt-2 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-300">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
