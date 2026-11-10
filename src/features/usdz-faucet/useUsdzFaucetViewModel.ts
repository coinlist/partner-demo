'use client';

import { useState } from 'react';
import { formatUnits } from 'viem';
import { useToast } from '@/components/toast/useToast';
import { useEvmWallet } from '@/lib/evm-wallet';
import {
  DEFAULT_FAUCET_AMOUNT,
  isUserRejection,
  parseFaucetAmount,
  USDZ,
  useUsdzWallet,
} from '@/lib/usdz';

export type UsdzFaucetUiState = {
  walletAddress: string | null;
  amountInput: string;
  amountError: string | null;
  /** Formatted for display, or `null` while unknown. */
  usdzBalance: string | null;
  /** The wallet has no Sepolia ETH, so it can't pay gas for a mint. */
  needsSepoliaEth: boolean;
  minting: boolean;
};

export type UsdzFaucetUiEvent =
  | { type: 'ON_CONNECT' }
  | { type: 'ON_AMOUNT_CHANGE'; value: string }
  | { type: 'ON_MINT' }
  | { type: 'ON_ADD_TO_WALLET' };

const balanceFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

export function useUsdzFaucetViewModel(): {
  state: UsdzFaucetUiState;
  onEvent: (event: UsdzFaucetUiEvent) => void;
} {
  const { address, connect } = useEvmWallet();
  const { usdzBalance, ethBalance, mint, addToWallet } = useUsdzWallet(address);
  const { showToast } = useToast();
  const [amountInput, setAmountInput] = useState(DEFAULT_FAUCET_AMOUNT);
  const [minting, setMinting] = useState(false);

  const parsed = parseFaucetAmount(amountInput);

  const state: UsdzFaucetUiState = {
    walletAddress: address,
    amountInput,
    amountError: parsed.ok ? null : parsed.error,
    usdzBalance:
      usdzBalance === undefined
        ? null
        : balanceFormat.format(Number(formatUnits(usdzBalance, USDZ.decimals))),
    needsSepoliaEth: ethBalance === BigInt(0),
    minting,
  };

  const onMint = async () => {
    if (!parsed.ok) return;
    setMinting(true);
    try {
      await mint(parsed.amount);
      showToast(`Minted ${amountInput.trim()} USDZ to your wallet.`, 'success');
    } catch (error) {
      showToast(
        isUserRejection(error)
          ? 'Mint cancelled in your wallet.'
          : 'Could not mint USDZ. Try again.',
        'error'
      );
    } finally {
      setMinting(false);
    }
  };

  const onAddToWallet = async () => {
    try {
      await addToWallet();
    } catch (error) {
      if (!isUserRejection(error)) {
        showToast('Your wallet could not add USDZ.', 'error');
      }
    }
  };

  const onEvent = (event: UsdzFaucetUiEvent) => {
    switch (event.type) {
      case 'ON_CONNECT':
        connect();
        break;
      case 'ON_AMOUNT_CHANGE':
        setAmountInput(event.value);
        break;
      case 'ON_MINT':
        void onMint();
        break;
      case 'ON_ADD_TO_WALLET':
        void onAddToWallet();
        break;
    }
  };

  return { state, onEvent };
}
