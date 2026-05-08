'use client';

import { OffersGrid } from '@coinlist-co/react';
import type { Offer } from '@coinlist-co/react/shared';
import { Settings } from 'lucide-react';
import type {
  HomeUiEvent,
  HomeUiState,
} from '@/features/home/useHomeViewModel';

export interface Props {
  state: HomeUiState;
  onEvent: (event: HomeUiEvent) => void;
}

export function HomeView({ state, onEvent }: Props) {
  const onSettingsClick = () => {
    onEvent({ type: 'ON_SETTINGS_CLICK' });
  };
  const onOfferClick = (offer: Offer) => {
    onEvent({ type: 'ON_OFFER_CLICK', offer });
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 px-6 py-6 font-sans dark:bg-black">
      <div className="flex justify-end">
        <SettingsButton onClick={onSettingsClick} />
      </div>
      <div className="mt-4 flex flex-1 items-center justify-center sm:mt-6">
        <OffersGrid
          data={state.preloadedOffers}
          onOfferClick={onOfferClick}
          className="justify-items-center"
          loading={<OffersGridLoading />}
        />
      </div>
    </div>
  );
}

function OffersGridLoading() {
  return (
    <div className="flex w-full items-center justify-center py-12">
      <div
        aria-label="Loading offers"
        className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100"
      />
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
