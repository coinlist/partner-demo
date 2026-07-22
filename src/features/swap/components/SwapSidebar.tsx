'use client';

import type { SidebarUi } from '@/features/swap/useSwapViewModel';

interface Props {
  state: SidebarUi;
}

/** Read-only sale details shown alongside the swap steps. */
export function SwapSidebar({ state }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-white dark:bg-zinc-600">
          {state.tokenSymbol.slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {state.tokenName}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Issued by {state.issuer}
          </p>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        <SidebarRow label="Price per share" value={state.pricePerShare} />
        <SidebarRow label="Network" value={state.network} />
        <SidebarRow label="Pay with" value={state.acceptedAsset} />
        {state.minPurchase && (
          <SidebarRow label="Minimum purchase" value={state.minPurchase} />
        )}
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
