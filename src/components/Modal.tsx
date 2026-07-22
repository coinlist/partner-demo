'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Minimal centered modal: renders into a portal, closes on backdrop click or
 * Escape. Intentionally unstyled beyond a card shell so callers own the body.
 */
export function Modal({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/50"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        {children}
      </div>
    </div>,
    document.body
  );
}
