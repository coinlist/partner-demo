"use client";

import { OfferBanner } from "./components/OfferBanner";
import { OfferFaq } from "./components/OfferFaq";
import { OfferHeader } from "./components/OfferHeader";
import { OfferLink } from "./components/OfferLink";
import { OfferMilestones } from "./components/OfferMilestones";
import { OfferSidebarCard } from "./components/OfferSidebarCard";
import { OfferTerms } from "./components/OfferTerms";
import { ArrowLeft } from "lucide-react";
import { OfferUiEvent, OfferUiState } from "./useOfferViewModel";

export interface Props {
  state: OfferUiState;
  onEvent: (event: OfferUiEvent) => void;
}

export function OfferView({ state, onEvent }: Props) {
  if (state.type === "LOADING") {
    return (
      <div className="min-h-screen bg-zinc-950 px-6 py-8 font-sans text-zinc-100">
        <div className="mx-auto w-full max-w-6xl animate-pulse space-y-4">
          <div className="h-40 rounded-2xl bg-zinc-900" />
          <div className="h-24 rounded-2xl bg-zinc-900" />
          <div className="h-56 rounded-2xl bg-zinc-900" />
        </div>
      </div>
    );
  }

  if (state.type === "ERROR") {
    return (
      <div className="min-h-screen bg-zinc-950 px-6 py-8 font-sans text-zinc-100">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-red-900/50 bg-red-950/30 p-6">
          <h1 className="text-lg font-semibold text-red-200">
            Could not load offer
          </h1>
          <p className="mt-2 text-sm text-red-200/90">{state.message}</p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => onEvent({ type: "ON_BACK_CLICK" })}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
            >
              <ArrowLeft size={16} />
              Back to offers
            </button>
            {!state.isAuthError ? (
              <button
                type="button"
                onClick={() => onEvent({ type: "ON_RETRY_CLICK" })}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
              >
                Retry
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-8 font-sans text-zinc-100">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <button
          type="button"
          onClick={() => onEvent({ type: "ON_BACK_CLICK" })}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
        >
          <ArrowLeft size={16} />
          Back to offers
        </button>

        <OfferBanner name={state.name} bannerUrl={state.bannerUrl} />

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <div className="lg:hidden">
              <OfferSidebarCard
                statusText="Token Sale"
                tokenCode={state.tokenCode}
                tokenPriceUsd={state.tokenPriceUsd}
              />
            </div>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
              <OfferHeader
                name={state.name}
                tagline={state.tagline}
                logoUrl={state.logoUrl}
              />
              <div className="mt-5">
                <h2 className="text-xl font-semibold text-zinc-100">About</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {state.about ?? "No description available yet."}
                </p>
              </div>
              {state.links.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {state.links.map((link) => (
                    <OfferLink key={link.label + link.url} link={link} />
                  ))}
                </div>
              ) : null}
            </section>

            {state.terms.length > 0 ? <OfferTerms terms={state.terms} /> : null}
            {state.milestones.length > 0 ? (
              <OfferMilestones milestones={state.milestones} />
            ) : null}
            {state.faqs.length > 0 ? <OfferFaq faqs={state.faqs} /> : null}
          </div>

          <div className="hidden lg:block">
            <OfferSidebarCard
              statusText="Token Sale"
              tokenCode={state.tokenCode}
              tokenPriceUsd={state.tokenPriceUsd}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
