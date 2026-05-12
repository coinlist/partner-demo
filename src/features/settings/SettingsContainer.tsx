'use client';

import { SettingsView } from '@/features/settings/SettingsView';
import { useSettingsViewModel } from '@/features/settings/useSettingsViewModel';

export function SettingsContainer() {
  const { state, onEvent } = useSettingsViewModel();
  return <SettingsView state={state} onEvent={onEvent} />;
}
