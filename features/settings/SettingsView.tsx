"use client";

import { InlineErrorText } from "@/components/InlineErrorText";
import { SettingsUiEvent, SettingsUiState } from "./useSettingsViewModel";

export interface Props {
  state: SettingsUiState;
  onEvent: (event: SettingsUiEvent) => void;
}

export function SettingsView({ state, onEvent }: Props) {
  const onLogoutClick = () => {
    onEvent({ type: "ON_LOGOUT" });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={onLogoutClick}
        disabled={state.logoutLoading}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        {state.logoutLoading ? "Signing out…" : "Sign out"}
      </button>
      <InlineErrorText message={state.logoutError} />
    </div>
  );
}
