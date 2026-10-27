'use client';

import { useContext } from 'react';
import { ToastContext, type ToastContextType } from '@/components/toast/Toast';

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
