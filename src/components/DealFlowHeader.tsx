import { ArrowLeft } from 'lucide-react';
import { formatCountdown } from '@/lib/countdown';

interface DealFlowHeaderProps {
  backLabel: string;
  onBack: () => void;
  /** The offer's end date, or null when it has no end date (badge hidden). */
  endsAt: Date | null;
}

/**
 * Top bar shared by the invest and swap flows: a "back to deal" button and,
 * when the offer has an end date, an "Ends in …" countdown badge. Both flows
 * render this identically; only the back label and handler differ.
 */
export function DealFlowHeader({
  backLabel,
  onBack,
  endsAt,
}: DealFlowHeaderProps) {
  return (
    <div className="mx-auto mb-8 flex w-full max-w-5xl items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <ArrowLeft size={16} />
        {backLabel}
      </button>
      {endsAt && (
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Ends in {formatCountdown(endsAt)}
        </div>
      )}
    </div>
  );
}
