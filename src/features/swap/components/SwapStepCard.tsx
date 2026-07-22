'use client';

import { Check } from 'lucide-react';
import type { StepStatus } from '@/features/swap/useSwapViewModel';

interface Props {
  index: number;
  title: string;
  status: StepStatus;
  summary?: string | null;
  onEdit?: () => void;
  children?: React.ReactNode;
}

/**
 * One step of the swap accordion. `active` expands the body; `completed`
 * collapses to a summary with an Edit action; `inactive` shows a dimmed header.
 */
export function SwapStepCard({
  index,
  title,
  status,
  summary,
  onEdit,
  children,
}: Props) {
  const completed = status === 'completed';
  const inactive = status === 'inactive';

  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 ${
        inactive ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            completed
              ? 'bg-green-500 text-white'
              : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
          }`}
        >
          {completed ? <Check size={16} /> : index}
        </span>
        <h2 className="flex-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        {completed && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-sm font-medium text-zinc-500 underline transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Edit
          </button>
        )}
      </div>

      {completed && summary && (
        <p className="mt-3 pl-10 text-sm text-zinc-600 dark:text-zinc-300">
          {summary}
        </p>
      )}

      {status === 'active' && children && (
        <div className="mt-5">{children}</div>
      )}
    </div>
  );
}
