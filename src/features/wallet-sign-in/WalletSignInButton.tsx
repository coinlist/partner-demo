'use client';

import { InlineErrorText } from '@/components/InlineErrorText';
import type {
  WalletSignInUiEvent,
  WalletSignInUiState,
} from '@/features/wallet-sign-in/useWalletSignInViewModel';

export function WalletSignInButton({
  state,
  onEvent,
  className,
}: {
  state: WalletSignInUiState;
  onEvent: (event: WalletSignInUiEvent) => void;
  className: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => onEvent({ type: 'ON_SIGN_IN_CLICK' })}
        disabled={state.disabled}
        className={className}
      >
        {state.label}
      </button>
      <InlineErrorText message={state.error} />
    </div>
  );
}
