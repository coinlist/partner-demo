'use client';

import {
  ClaimContainer,
  RequirementsChecklistContainer,
  usePassage,
} from '@passage-cl/react';
import type {
  AsyncOfferDetail,
  OfferId,
  OfferOptionId,
} from '@passage-cl/react/universal';
import { useState } from 'react';
import type { OfferUiOption } from '@/features/offer/useOfferViewModel';
import { useClaimWallets } from '@/lib/claim-wallets';
import { useEvmWallet } from '@/lib/evm-wallet';

/** Every claim entry is optional, so the demo passes none. */
const CLAIM_CONFIG = { 'centrifuge::vault': {} } as const;

export function OfferRequirementsCard({
  offerId,
  options,
  selectedOptionId,
  claimableOffer,
  isCoinListUser,
  onOptionSelect,
  onContinue,
  onSell,
  tradeToggle = false,
}: {
  offerId: OfferId;
  options: OfferUiOption[];
  selectedOptionId: OfferOptionId | null;
  claimableOffer: AsyncOfferDetail | null;
  /**
   * Requirement statuses belong to a CoinList user, so a visitor without an
   * account signs in from the header, then buys.
   */
  isCoinListUser: boolean;
  onOptionSelect: (optionId: OfferOptionId) => void;
  onContinue: () => void;
  /**
   * Opens the sell checkout. Only a sellable offer passes this, and then the
   * checklist's Continue reads "Buy" so the two directions read as a pair.
   */
  onSell?: () => void;
  /**
   * Invest / Redeem above the checklist, for a portfolio. Continue follows
   * the selected side, so there is no second button.
   */
  tradeToggle?: boolean;
}) {
  const { connectWallet, connect } = useEvmWallet();
  const { authState } = usePassage();
  const signedIn = authState.type === 'logged-in';
  const claimWallets = useClaimWallets();
  const hasChoice = options.length > 1;
  const [confirmed, setConfirmed] = useState(!hasChoice);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const selectedOption = options.find((opt) => opt.id === selectedOptionId);
  const showRequirements = !hasChoice || confirmed;
  const buyLabel = onSell && !tradeToggle ? 'Buy' : 'Continue';
  const checklistTitle = tradeToggle ? 'Requirements' : 'Sale Requirements';
  const checklistDescription = tradeToggle
    ? `Complete the requirements below to ${side === 'sell' ? 'redeem' : 'invest'}.`
    : 'Complete the requirements below to be eligible.';
  const onPrimary = () => {
    if (tradeToggle && side === 'sell') {
      onSell?.();
      return;
    }
    onContinue();
  };
  // The SDK's token-sale claim has no check for a wallet session, which would
  // read as an error card, so a wallet session claims on a vault only.
  const showClaim =
    claimableOffer &&
    (isCoinListUser ||
      (signedIn && claimableOffer.type === 'centrifuge::vault'));

  return (
    <div className="flex w-full flex-col gap-6">
      <aside className="flex w-full flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:rounded-[24px] md:p-6 dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-none">
        {tradeToggle ? (
          <TradeSideToggle side={side} onSelect={setSide} />
        ) : null}
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
          <>
            {/* The SDK's checkout opens a signed-out visitor as it is, and its
                reads then fail, so Buy and Sell wait for the header's sign-in. */}
            {isCoinListUser ? (
              <RequirementsChecklistContainer
                offerId={offerId}
                optionId={selectedOptionId}
                title={checklistTitle}
                description={checklistDescription}
                onContinue={onPrimary}
                continueLabel={buyLabel}
                wallet={connectWallet}
                onRequestConnect={connect}
              />
            ) : signedIn ? (
              <button
                type="button"
                onClick={onPrimary}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                {buyLabel}
              </button>
            ) : null}
            {onSell && !tradeToggle && (isCoinListUser || signedIn) ? (
              <button
                type="button"
                onClick={onSell}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full border border-zinc-300 bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Sell
              </button>
            ) : null}
          </>
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

      {/* Below the card rather than inside it, so the orders get the
          column's full width. */}
      {showClaim ? (
        <ClaimContainer
          key={claimableOffer.id.toString()}
          offers={claimableOffer}
          wallets={claimWallets}
          config={CLAIM_CONFIG}
        />
      ) : null}
    </div>
  );
}

function TradeSideToggle({
  side,
  onSelect,
}: {
  side: 'buy' | 'sell';
  onSelect: (side: 'buy' | 'sell') => void;
}) {
  return (
    <div className="flex rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
      <SideButton
        label="Invest"
        selected={side === 'buy'}
        onSelect={() => onSelect('buy')}
      />
      <SideButton
        label="Redeem"
        selected={side === 'sell'}
        onSelect={() => onSelect('sell')}
      />
    </div>
  );
}

function SideButton({
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
      className={`flex-1 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition ${
        selected
          ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
      }`}
    >
      {label}
    </button>
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
