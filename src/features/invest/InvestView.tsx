'use client';

import { ArrowLeft, ChevronRight, Wallet, X } from 'lucide-react';
import type {
  InvestUiEvent,
  InvestUiState,
} from '@/features/invest/useInvestViewModel';

interface Props {
  state: InvestUiState;
  onEvent: (event: InvestUiEvent) => void;
}

function formatCountdown(endsAt: Date): string {
  const diff = endsAt.getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days}D ${hours}H ${minutes}M`;
}

export function InvestView({ state, onEvent }: Props) {
  const isConnected = state.walletState.type === 'CONNECTED';
  const canSubmit =
    isConnected &&
    state.amountInput.length > 0 &&
    state.submitState !== 'submitting';

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-8 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      {/* Top row */}
      <div className="mx-auto mb-8 flex w-full max-w-5xl items-center justify-between">
        <button
          type="button"
          onClick={() => onEvent({ type: 'ON_BACK_CLICK' })}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ArrowLeft size={16} />
          {state.backLabel}
        </button>
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Ends in {formatCountdown(state.endsAt)}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left — Commitment card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
          <h1 className="mb-5 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Commitment
          </h1>

          {/* Funding source */}
          <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
            Funding source
          </p>

          {isConnected && state.walletState.type === 'CONNECTED' ? (
            <div className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700">
              <Wallet size={18} className="text-zinc-500 dark:text-zinc-400" />
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {state.walletState.truncatedAddress}
                </span>
                {state.walletState.ethBalance && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {state.walletState.ethBalance}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onEvent({ type: 'ON_DISCONNECT_WALLET' })}
                className="text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label="Disconnect wallet"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onEvent({ type: 'ON_CONNECT_WALLET' })}
              className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-left transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <Wallet size={18} className="text-zinc-500 dark:text-zinc-400" />
              <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Connect wallet
              </span>
              <ChevronRight size={16} className="text-zinc-400" />
            </button>
          )}

          {isConnected && (
            <>
              <hr className="my-4 border-zinc-100 dark:border-zinc-800" />

              {/* Pay with */}
              <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
                Pay with
              </p>
              <div className="mb-5 flex gap-2">
                {state.fundingAssets.map((asset) => (
                  <button
                    key={asset.assetId.toString()}
                    type="button"
                    onClick={() =>
                      onEvent({
                        type: 'ON_ASSET_SELECT',
                        assetId: asset.assetId,
                      })
                    }
                    className={`flex flex-col items-start rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      asset.assetId === state.selectedPayWithAssetId
                        ? 'border-zinc-900 bg-white text-zinc-900 ring-1 ring-zinc-900 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-100'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{asset.code}</span>
                    {asset.balance !== null && (
                      <span className="mt-0.5 text-xs font-normal text-zinc-400 dark:text-zinc-500">
                        {asset.balance} available
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
                Amount
              </p>
              <div className="mb-5 flex items-center rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700">
                <span className="text-sm text-zinc-400">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={state.amountInput}
                  onChange={(e) =>
                    onEvent({ type: 'ON_AMOUNT_CHANGE', value: e.target.value })
                  }
                  placeholder="0"
                  className="flex-1 bg-transparent px-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
                />
                {state.tokenEquivalent && (
                  <span className="whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
                    {state.tokenEquivalent}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Sign & Commit */}
          <button
            type="button"
            onClick={() => onEvent({ type: 'ON_SIGN_AND_COMMIT' })}
            disabled={!canSubmit}
            className={`mt-4 w-full rounded-2xl py-4 text-sm font-semibold transition ${
              canSubmit
                ? 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100'
                : 'cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-500'
            }`}
          >
            {state.submitState === 'submitting'
              ? 'Submitting…'
              : 'Sign & Commit'}
          </button>

          {state.submitState === 'error' && state.submitError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {state.submitError}
            </p>
          )}

          {/* Footer */}
          <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
            By committing, you agree to the{' '}
            {state.saleAgreementUrl ? (
              <a
                href={state.saleAgreementUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Sale Agreements
              </a>
            ) : (
              'Sale Agreements'
            )}
          </p>
        </div>

        {/* Right — Sidebar */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
          {/* Token info */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-white dark:bg-zinc-600">
                {state.sidebar.tokenCode.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {state.sidebar.tokenName}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  ${state.sidebar.tokenCode}
                </p>
              </div>
            </div>
            {state.sidebar.tokenPriceUsd && (
              <div className="text-right">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  ${state.sidebar.tokenPriceUsd}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Token Price
                </p>
              </div>
            )}
          </div>

          {/* Sidebar rows */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {state.sidebar.fullyDilutedValue && (
              <SidebarRow
                label="Fully Diluted Value"
                value={state.sidebar.fullyDilutedValue}
              />
            )}
            {state.sidebar.allocatedTokenSupply && (
              <SidebarRow
                label="Allocated Token Supply"
                value={state.sidebar.allocatedTokenSupply}
              />
            )}
            <SidebarRow
              label="Purchase Options"
              value={state.sidebar.purchaseOptions}
            />
            {state.sidebar.minimumPurchaseUsd && (
              <SidebarRow
                label="Purchase Limits"
                value={state.sidebar.minimumPurchaseUsd}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-3">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="ml-4 text-right text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </span>
    </div>
  );
}
