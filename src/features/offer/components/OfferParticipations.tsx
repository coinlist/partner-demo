'use client';

import type {
  ParticipationsUiState,
  ParticipationUi,
} from '@/features/offer/useOfferViewModel';

function statusLabel(status: ParticipationUi['status']): string {
  switch (status) {
    case 'completed':
      return 'Secured';
    case 'remitted':
    case 'remit_submitted':
      return 'Refunded';
    case 'failed':
    case 'remit_failed':
      return 'Failed';
    default:
      return 'Committed';
  }
}

function statusColor(status: ParticipationUi['status']): string {
  switch (status) {
    case 'completed':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'remitted':
    case 'remit_submitted':
      return 'text-sky-600 dark:text-sky-400';
    case 'failed':
    case 'remit_failed':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-zinc-700 dark:text-zinc-300';
  }
}

const EXPLORER_MAP: Record<string, (address: string) => string> = {
  ethereum: (a) => `https://etherscan.io/address/${a}`,
  solana: (a) => `https://solscan.io/account/${a}`,
};

function explorerUrl(
  chain: string,
  walletAddress: string | null
): string | null {
  if (!walletAddress) return null;
  const builder = EXPLORER_MAP[chain.toLowerCase()];
  return builder ? builder(walletAddress) : null;
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function AssetAvatar({ code }: { code: string }) {
  const letter = code.charAt(0).toUpperCase();
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
      {letter}
    </div>
  );
}

function ParticipationRow({
  participation,
}: {
  participation: ParticipationUi;
}) {
  const label = statusLabel(participation.status);
  const colorClass = statusColor(participation.status);
  const date = formatDate(participation.insertedAt);
  const url = explorerUrl(participation.chain, participation.walletAddress);

  const content = (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
      <AssetAvatar code={participation.assetCode} />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${colorClass}`}>
          {participation.displayAmount} {label}
        </p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {participation.assetCode}
          {date ? ` • ${date}` : ''}
        </p>
      </div>
    </div>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return <div>{content}</div>;
}

export function OfferParticipations({
  state,
}: {
  state: ParticipationsUiState;
}) {
  if (state.type === 'LOADING') {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-none">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          My Participations
        </p>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-3 px-2 py-2"
            >
              <div className="h-9 w-9 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-2.5 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isError = state.type === 'ERROR';
  const isEmpty = state.type === 'CONTENT' && state.participations.length === 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-none">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        My Participations
      </p>
      {isError ? (
        <p className="px-2 py-3 text-sm text-zinc-400 dark:text-zinc-500">
          Failed to load participations.
        </p>
      ) : isEmpty ? (
        <p className="px-2 py-3 text-sm text-zinc-400 dark:text-zinc-500">
          No participations yet.
        </p>
      ) : (
        <div className="-mx-2">
          {state.type === 'CONTENT' &&
            state.participations.map((p) => (
              <ParticipationRow key={p.id} participation={p} />
            ))}
        </div>
      )}
    </div>
  );
}
