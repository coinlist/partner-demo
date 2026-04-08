"use client";

type OfferFaqItem = {
  question: string;
  answer: string;
};

export function OfferFaq({ faqs }: { faqs: OfferFaqItem[] }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
      <h2 className="text-xl font-semibold text-zinc-100">FAQ</h2>
      <div className="mt-4 divide-y divide-zinc-800">
        {faqs.map((faq) => (
          <details key={faq.question} className="py-3">
            <summary className="cursor-pointer text-sm font-medium text-zinc-100">
              {faq.question}
            </summary>
            <p className="mt-2 text-sm text-zinc-300">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
