"use client";

import { OffersGrid } from "@coinlist-co/react/client/components";
import { Settings } from "lucide-react";
import { HomeUiEvent, HomeUiState } from "./useHomeViewModel";

export interface Props {
  state: HomeUiState;
  onEvent: (event: HomeUiEvent) => void;
}

export function HomeView({ state, onEvent }: Props) {
  const onSettingsClick = () => {
    onEvent({ type: "ON_SETTINGS_CLICK" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 px-6 py-6 font-sans dark:bg-black">
      <div className="flex justify-end">
        <SettingsButton onClick={onSettingsClick} />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <OffersGrid />
      </div>
    </div>
  );
}

function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open settings"
      title="Settings"
      className="rounded-full border border-zinc-300 bg-white p-2 text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
    >
      <Settings size={18} />
    </button>
  );
}
