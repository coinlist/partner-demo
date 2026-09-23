'use client';

import { RequirementsChecklistContainer } from '@coinlist-co/react';
import type { OfferId, OfferOptionId } from '@coinlist-co/react/universal';
import { useState } from 'react';
import type { OfferUiOption } from '@/features/offer/useOfferViewModel';
import { useEvmWallet } from '@/lib/evm-wallet';

export function OfferRequirementsCard({
  offerId,
  options,
  selectedOptionId,
  onOptionSelect,
  onContinue,
}: {
  offerId: OfferId;
  options: OfferUiOption[];
  selectedOptionId: OfferOptionId | null;
  onOptionSelect: (optionId: OfferOptionId) => void;
  onContinue: () => void;
}) {
  const { connectWallet, connect } = useEvmWallet();
  const hasChoice = options.length > 1;
  const [confirmed, setConfirmed] = useState(!hasChoice);
  const selectedOption = options.find((opt) => opt.id === selectedOptionId);
  const showRequirements = !hasChoice || confirmed;

  return (
    <aside className="flex w-full flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:rounded-[24px] md:p-6 dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-none">
      {showRequirements && hasChoice && selectedOption ? (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Sale option
              </p>
              <p className="truncate text-base font-semibold text-zinc-900 capitalize dark:text-zinc-100">
                {optionLabel(selectedOption.slug)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmed(false)}
              className="inline-flex h-9 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-full bg-zinc-100 px-5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              Change
            </button>
          </div>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
        </>
      ) : null}

      {showRequirements && selectedOptionId ? (
        <RequirementsChecklistContainer
          offerId={offerId}
          optionId={selectedOptionId}
          title="Sale Requirements"
          description="Complete the requirements below to be eligible."
          onContinue={onContinue}
          wallet={connectWallet}
          onRequestConnect={connect}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
            Select offer option
          </p>
          <div className="flex flex-col gap-3">
            {options.map((opt) => (
              <OptionRow
                key={opt.id.toString()}
                label={optionLabel(opt.slug)}
                selected={opt.id === selectedOptionId}
                onSelect={() => onOptionSelect(opt.id)}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={!selectedOptionId}
            onClick={() => setConfirmed(true)}
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Continue
          </button>
        </div>
      )}
    </aside>
  );
}

function optionLabel(slug: string): string {
  return slug.replace(/-/g, ' ');
}

function OptionRow({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border-[1.5px] px-4 py-3 text-left transition ${
        selected
          ? 'border-zinc-900 dark:border-zinc-100'
          : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-500'
      }`}
    >
      <span className="text-base font-medium text-zinc-900 capitalize dark:text-zinc-100">
        {label}
      </span>
      <RadioCircle selected={selected} />
    </button>
  );
}

function RadioCircle({ selected }: { selected: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle
        cx="10"
        cy="10"
        r="7"
        stroke="currentColor"
        strokeWidth="1.5"
        className={
          selected
            ? 'text-zinc-900 dark:text-zinc-100'
            : 'text-zinc-300 dark:text-zinc-600'
        }
      />
      {selected ? (
        <circle
          cx="10"
          cy="10"
          r="4"
          fill="currentColor"
          className="text-zinc-900 dark:text-zinc-100"
        />
      ) : null}
    </svg>
  );
}
