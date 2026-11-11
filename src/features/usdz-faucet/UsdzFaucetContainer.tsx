'use client';

import { UsdzFaucetView } from '@/features/usdz-faucet/UsdzFaucetView';
import { useUsdzFaucetViewModel } from '@/features/usdz-faucet/useUsdzFaucetViewModel';

export function UsdzFaucetContainer() {
  const { state, onEvent } = useUsdzFaucetViewModel();
  return <UsdzFaucetView state={state} onEvent={onEvent} />;
}
