'use client';

import { SettingsView } from './SettingsView';
import { useSettingsViewModel } from './useSettingsViewModel';

export function SettingsContainer() {
  const { state, onEvent } = useSettingsViewModel();
  return <SettingsView state={state} onEvent={onEvent} />;
}
