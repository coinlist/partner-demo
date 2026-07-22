'use client';

import { Check, ExternalLink } from 'lucide-react';
import { Modal } from '@/components/Modal';
import type {
  OrderConfirmedUi,
  SwapUiEvent,
} from '@/features/swap/useSwapViewModel';

interface Props {
  order: OrderConfirmedUi | null;
  onEvent: (event: SwapUiEvent) => void;
}

/** Success dialog shown after a swap confirms on-chain. */
export function OrderConfirmedDialog({ order, onEvent }: Props) {
  const close = () => onEvent({ type: 'ON_CLOSE_CONFIRMED' });

  return (
    <Modal open={order !== null} onClose={close}>
      {order && (
        <div>
          <div className="mb-4 flex flex-col items-center text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
              <Check size={24} />
            </span>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Order confirmed
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {order.tokenName} · Issued by {order.issuer}
            </p>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <Row label="Total cost" value={order.totalCost} />
            <Row label="Shares received" value={order.sharesReceived} />
            <Row label="Price per share" value={order.pricePerShare} />
            <Row label="Delivered to" value={order.recipient} />
          </div>

          <a
            href={order.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-zinc-500 underline transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            View transaction
            <ExternalLink size={14} />
          </a>

          <button
            type="button"
            onClick={close}
            className="mt-5 w-full rounded-2xl bg-zinc-900 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-right text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </span>
    </div>
  );
}
