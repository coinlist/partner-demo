'use client';

import { AlertCircle, Check } from 'lucide-react';
import type React from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';
import type { Toast, ToastType } from '@/components/toast/useToast';

export interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType, duration = 3000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToastAction={removeToast} />
    </ToastContext.Provider>
  );
};

export const ToastContainer: React.FC<{
  toasts: Toast[];
  removeToastAction: (id: string) => void;
}> = ({ toasts, removeToastAction: removeToast }) => {
  return (
    <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({
  toast,
  onRemove,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Handle auto-dismiss
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onRemove, 300); // Wait for exit animation
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  const styles = {
    success:
      'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/40 dark:border-green-800 dark:text-green-300',
    error:
      'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-800 dark:text-red-300',
  };

  return (
    <div
      role="alert"
      className={`
        pointer-events-auto flex items-center gap-3 rounded-full border px-4 py-3 shadow-md backdrop-blur-sm
        transition-all duration-300 ease-out will-change-transform
        ${styles[toast.type]}
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}
      `}
    >
      {/* Icon Wrapper */}
      <div className="shrink-0">
        {toast.type === 'success' ? (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white dark:bg-green-400 dark:text-gray-900">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </div>
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        )}
      </div>

      <p className="text-sm font-medium">{toast.message}</p>
    </div>
  );
};
