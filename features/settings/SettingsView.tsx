'use client';

import { LogOut, Settings } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { InlineErrorText } from '@/components/InlineErrorText';
import type { SettingsUiEvent, SettingsUiState } from './useSettingsViewModel';

export interface Props {
  state: SettingsUiState;
  onEvent: (event: SettingsUiEvent) => void;
}

export function SettingsView({ state, onEvent }: Props) {
  const onLogoutClick = () => {
    onEvent({ type: 'ON_LOGOUT' });
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 font-sans dark:bg-black">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="space-y-5">
          <div className="flex items-center justify-start">
            <BackButton label="Back" />
          </div>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <Settings size={14} />
              Settings
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Account settings
            </h1>
            <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              Manage your account actions and preferences.
            </p>
            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                Sign out
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                End your current session on this device.
              </p>
            </div>
            <button
              type="button"
              onClick={onLogoutClick}
              disabled={state.logoutLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
            >
              <LogOut size={16} />
              {state.logoutLoading ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
          <div className="mt-3">
            <InlineErrorText message={state.logoutError} />
          </div>
        </section>
      </div>
    </div>
  );
}
