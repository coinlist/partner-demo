'use client';

import type {
  TokenSaleExecutionError,
  TokenSaleExecutionPhase,
  WalletError,
} from '@coinlist-co/react';
import {
  executeTokenSale,
  useCoinList,
  useErc20TokenBalances,
} from '@coinlist-co/react';
import {
  type AmountParseErrorReason,
  type Asset,
  AssetDecimals,
  type AssetId,
  type OfferDetail,
  type OfferId,
  type OfferOption,
  parseBlockchainAmount,
  type StablecoinSymbol,
} from '@coinlist-co/react/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatEther, parseUnits } from 'viem';
import { useBalance, useConfig, useWalletClient } from 'wagmi';
import { useToast } from '@/components/toast/useToast';
import { DEMO_CHAIN, DEMO_CHAIN_ID } from '@/lib/chain';
import { ZERO_WALLET_ADDRESS } from '@/lib/constants';
import { useEvmWallet } from '@/lib/evm-wallet';
import { ROUTES } from '@/lib/routes';
import { buildEvmWallet } from '@/lib/wagmiEvmWallet';
import {
  fundingContract,
  paymentSymbol,
  paymentTokenAddress,
} from '@/types/coinlist';

/**
 * Minimum ETH balance required to pay gas for the ERC-20 approve transaction.
 * The approval is an on-chain write and costs gas even though no tokens move.
 */
const MIN_ETH_FOR_GAS = parseUnits('0.001', 18);
const MIN_ETH_FOR_GAS_LABEL = '0.001 ETH';

// ─── Types ────────────────────────────────────────────────────────────────────

export type InvestUiState = {
  backLabel: string;
  endsAt: Date | null;
  walletState:
    | { type: 'DISCONNECTED' }
    | {
        type: 'CONNECTED';
        truncatedAddress: string;
        ethBalance: string | null;
      };
  fundingAssets: {
    assetId: AssetId;
    code: string;
    balance: string | null;
  }[];
  selectedPayWithAssetId: AssetId | null;
  amountInput: string;
  tokenEquivalent: string | null;
  saleAgreementUrl: string | null;
  submitState: SubmitStateUi;
  submitError: string | null;
  sidebar: {
    tokenName: string;
    tokenCode: string;
    tokenPriceUsd: string | null;
    fullyDilutedValue: string | null;
    allocatedTokenSupply: string | null;
    purchaseOptions: string;
    minimumPurchaseUsd: string | null;
  };
};

export type SubmitStateUi =
  | 'idle'
  | 'checking_allowance'
  | 'resetting_allowance'
  | 'confirming_reset'
  | 'awaiting_wallet'
  | 'confirming_tx'
  | 'recording'
  | 'error'
  | 'success';

export type InvestUiEvent =
  | { type: 'ON_BACK_CLICK' }
  | { type: 'ON_CONNECT_WALLET' }
  | { type: 'ON_DISCONNECT_WALLET' }
  | { type: 'ON_ASSET_SELECT'; assetId: AssetId }
  | { type: 'ON_AMOUNT_CHANGE'; value: string }
  | { type: 'ON_SIGN_AND_COMMIT' };

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInvestViewModel(
  offerDetail: OfferDetail,
  option: OfferOption
): { state: InvestUiState; onEvent: (event: InvestUiEvent) => void } {
  const router = useRouter();
  const { coinlist } = useCoinList();
  const { showToast } = useToast();
  // The demo's wallet seam: connect/disconnect + account state. On-chain writes
  // go through the SDK's `EvmWallet`, built below from the wagmi wallet client.
  const { address, isConnected, connect, disconnect } = useEvmWallet();
  const { data: walletClient } = useWalletClient();
  const wagmiConfig = useConfig();

  // Pin the ETH balance read to DEMO_CHAIN_ID so it reflects the chain the sale
  // runs on regardless of which chain the wallet is currently connected to.
  // Native ETH isn't an ERC-20, so it stays on wagmi rather than coinlist.erc20.
  const { data: ethBalance } = useBalance({
    address: address ?? undefined,
    chainId: DEMO_CHAIN_ID,
    query: { enabled: !!address },
  });

  // Only the funding assets the demo can actually pay with - the rest are
  // dropped, so an offer that also accepts an unsupported coin still funds
  // through the ones it does.
  const fundingAssets = supportedFundingAssets(offerDetail.fundingAssets);

  // ERC-20 (USDC/USDT) balances via the SDK. `useErc20TokenBalances` is keyed by
  // stablecoin symbol, so we derive each funding asset's symbol from its ticker.
  const fundingSymbols = fundingAssets.map(paymentSymbol) as [
    StablecoinSymbol,
    ...StablecoinSymbol[],
  ];
  const { balances } = useErc20TokenBalances({
    address: address ?? ZERO_WALLET_ADDRESS,
    chain: DEMO_CHAIN,
    assets: fundingSymbols,
    enabled: !!address && fundingSymbols.length > 0,
  });

  const [payWithAssetId, setPayWithAssetId] = useState<AssetId | null>(
    fundingAssets[0]?.id ?? null
  );
  // The selected funding asset carries everything the sale needs — its ticker
  // (→ SDK symbol + ERC-20 address) and decimals — so resolve it from the id.
  const payWithAsset: Asset | null =
    fundingAssets.find((a) => a.id === payWithAssetId) ?? null;
  const [amountInput, setAmountInput] = useState('');
  const [submitState, setSubmitState] = useState<SubmitStateUi>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const offerId: OfferId = offerDetail.id;
  const tokenCode = offerDetail.asset.code.toString();

  const state: InvestUiState = {
    backLabel: 'Back to deal page',
    endsAt: offerDetail.endsAt,
    walletState: deriveWalletState(isConnected, address, ethBalance?.value),
    fundingAssets: fundingAssets.map((a) => ({
      assetId: a.id,
      code: a.code.toString(),
      balance: formatTokenBalance(
        balances.get(paymentSymbol(a)) ?? undefined,
        a.fractionalDigits
      ),
    })),
    selectedPayWithAssetId: payWithAssetId,
    amountInput,
    tokenEquivalent: deriveTokenEquivalent(
      amountInput,
      option.priceUsd,
      tokenCode
    ),
    saleAgreementUrl: option.saleAgreementUrl,
    submitState,
    submitError,
    sidebar: deriveSidebar(offerDetail, option, tokenCode, fundingAssets),
  };

  const handleSignAndCommit = async () => {
    // Guard: these should be impossible if the UI is wired correctly.
    if (!isConnected || !address || !walletClient) return;

    // Not silent: `payWithAssetId` is selection state while `payWithAsset` is
    // resolved from the supported funding assets, so a refetch that drops the
    // selected asset leaves a set id with no asset behind it. Returning here
    // without a message would render Sign & Commit dead with no explanation.
    if (!payWithAsset) {
      setSubmitState('error');
      setSubmitError('No funding asset selected. Reload and try again.');
      return;
    }

    const validationError = validateSubmit({
      amountInput,
      ethBalanceWei: ethBalance?.value,
      minimumPurchaseUsd: option.minimumPurchaseUsd,
    });
    if (validationError) {
      setSubmitState('error');
      setSubmitError(validationError);
      return;
    }

    // Parse the entered amount into a `BlockchainAmount` at the token's
    // decimals. This also enforces token-precision limits that `validateSubmit`
    // (a numeric-range check) doesn't cover, e.g. more decimals than the token.
    const parsedAmount = parseBlockchainAmount(
      amountInput,
      AssetDecimals(payWithAsset.fractionalDigits)
    );
    if (!parsedAmount.valid) {
      setSubmitState('error');
      setSubmitError(amountParseErrorMessage(parsedAmount.reason));
      return;
    }

    setSubmitState('checking_allowance');
    setSubmitError(null);

    // The SDK's `executeTokenSale` drives the whole flow over an `EvmWallet`:
    // it reads the allowance, resets a stale non-zero allowance (USDT-style
    // tokens), submits + confirms the approve, and records the participation.
    // Chain switching is handled inside the wallet adapter.
    const wallet = buildEvmWallet({
      address,
      walletClient,
      config: wagmiConfig,
    });

    const result = await executeTokenSale({
      erc20: coinlist.erc20,
      tokenSale: coinlist.tokenSale,
      wallet,
      offerId,
      offerOptionId: option.id,
      assetId: payWithAsset.id,
      paymentTokenAddress: paymentTokenAddress(payWithAsset, DEMO_CHAIN),
      fundingContractAddress: fundingContract(offerId),
      chain: DEMO_CHAIN,
      amount: parsedAmount.amount,
      onProgress: (phase) => setSubmitState(phaseToSubmitState(phase)),
    });

    if (result.type === 'success') {
      setSubmitState('success');
      showToast('Participation recorded', 'success');
      router.push(ROUTES.OFFER_DETAILS(offerId));
      return;
    }

    setSubmitState('error');
    setSubmitError(executionErrorMessage(result.error));
  };

  const onEvent = (event: InvestUiEvent) => {
    switch (event.type) {
      case 'ON_BACK_CLICK':
        router.push(ROUTES.OFFER_DETAILS(offerId));
        break;
      case 'ON_CONNECT_WALLET':
        connect();
        break;
      case 'ON_DISCONNECT_WALLET':
        void disconnect();
        break;
      case 'ON_ASSET_SELECT':
        setPayWithAssetId(event.assetId);
        setSubmitState('idle');
        setSubmitError(null);
        break;
      case 'ON_AMOUNT_CHANGE':
        setAmountInput(event.value);
        setSubmitState('idle');
        setSubmitError(null);
        break;
      case 'ON_SIGN_AND_COMMIT':
        void handleSignAndCommit();
        break;
    }
  };

  return { state, onEvent };
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/**
 * The offer's funding assets narrowed to the ones the demo can pay with.
 *
 * `paymentSymbol` throws on a ticker the demo has no entry for, which used to
 * take the whole invest page down mid-render. Dropping those assets keeps the
 * flow usable for every coin that is supported; an offer funded solely in
 * unsupported coins ends up with an empty picker and a disabled submit.
 */
function supportedFundingAssets(assets: readonly Asset[]): Asset[] {
  return assets.filter((asset) => {
    try {
      paymentSymbol(asset);
      return true;
    } catch {
      return false;
    }
  });
}

function formatTokenBalance(
  balanceRaw: bigint | undefined,
  decimals: number
): string | null {
  if (balanceRaw === undefined) return null;
  const value = Number(balanceRaw) / 10 ** decimals;
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function deriveWalletState(
  isConnected: boolean,
  address: string | null,
  ethBalanceWei: bigint | undefined
): InvestUiState['walletState'] {
  if (!isConnected || !address) return { type: 'DISCONNECTED' };
  const truncatedAddress =
    address.length > 10
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;
  const ethBalance =
    ethBalanceWei !== undefined
      ? `${parseFloat(formatEther(ethBalanceWei)).toFixed(7)} ETH`
      : null;
  return { type: 'CONNECTED', truncatedAddress, ethBalance };
}

function deriveTokenEquivalent(
  amountInput: string,
  priceUsd: string | null,
  tokenCode: string
): string | null {
  if (!amountInput || !priceUsd) return null;
  const amount = parseFloat(amountInput);
  const price = parseFloat(priceUsd);
  if (Number.isNaN(amount) || Number.isNaN(price) || price === 0) return null;
  return `≈ ${(amount / price).toLocaleString()} ${tokenCode}`;
}

function deriveSidebar(
  offerDetail: OfferDetail,
  option: OfferOption,
  tokenCode: string,
  fundingAssets: Asset[]
): InvestUiState['sidebar'] {
  return {
    tokenName: offerDetail.name,
    tokenCode,
    tokenPriceUsd: option.priceUsd,
    fullyDilutedValue:
      option.totalTokenSupply != null && option.priceUsd != null
        ? `$${(option.totalTokenSupply * parseFloat(option.priceUsd)).toLocaleString()}`
        : null,
    allocatedTokenSupply:
      option.totalTokenSupply != null
        ? `${option.totalTokenSupply.toLocaleString()} ${tokenCode}`
        : null,
    // The coins the user can actually pick, not everything the offer lists: a
    // row naming a coin the picker dropped would contradict it.
    purchaseOptions: fundingAssets.map((a) => a.code.toString()).join(', '),
    minimumPurchaseUsd:
      option.minimumPurchaseUsd != null
        ? `Minimum: $${option.minimumPurchaseUsd}`
        : null,
  };
}

/**
 * Validates all prerequisites before attempting the on-chain approval.
 * Returns a user-facing error string, or null if everything is valid.
 */
function validateSubmit({
  amountInput,
  ethBalanceWei,
  minimumPurchaseUsd,
}: {
  amountInput: string;
  ethBalanceWei: bigint | undefined;
  minimumPurchaseUsd: number | null;
}): string | null {
  const amount = parseFloat(amountInput.trim());
  if (!amountInput.trim() || Number.isNaN(amount) || amount <= 0) {
    return 'Please enter a valid amount greater than zero.';
  }

  if (minimumPurchaseUsd != null && amount < minimumPurchaseUsd) {
    return `Amount must be at least $${minimumPurchaseUsd.toLocaleString()}.`;
  }

  // Warn early if the wallet lacks ETH to pay gas. The approve tx will
  // fail on-chain anyway, but this surfaces the issue before MetaMask opens.
  if (ethBalanceWei !== undefined && ethBalanceWei < MIN_ETH_FOR_GAS) {
    return `Insufficient ETH for gas. You need at least ${MIN_ETH_FOR_GAS_LABEL} in your wallet to cover the transaction fee.`;
  }

  return null;
}

/**
 * Maps a {@link TokenSaleExecutionPhase} emitted by the SDK's `executeTokenSale`
 * to the UI's submit state. The reset phases only occur for USDT-style tokens
 * that hold a stale non-zero allowance.
 */
function phaseToSubmitState(phase: TokenSaleExecutionPhase): SubmitStateUi {
  switch (phase) {
    case 'checking-allowance':
      return 'checking_allowance';
    case 'resetting-allowance':
      return 'resetting_allowance';
    case 'confirming-allowance-reset':
      return 'confirming_reset';
    case 'approving':
      return 'awaiting_wallet';
    case 'confirming-approval':
      return 'confirming_tx';
    case 'recording-participation':
      return 'recording';
    default: {
      const _exhaustive: never = phase;
      return _exhaustive;
    }
  }
}

/**
 * Turns the SDK's step-tagged {@link TokenSaleExecutionError} into a
 * user-facing message. Each step the flow can fail at gets its own message so
 * the user knows which of the two wallet prompts they rejected, whether an
 * approval reverted on-chain, or whether only the final recording failed.
 */
function executionErrorMessage(error: TokenSaleExecutionError): string {
  switch (error.step) {
    case 'allowance-check':
      return "We couldn't read your current token allowance. Please try again.";
    case 'allowance-reset':
      return walletErrorMessage(
        error.cause,
        'resetting your existing allowance'
      );
    case 'allowance-reset-reverted':
      return 'The allowance reset transaction failed on-chain. Please try again.';
    case 'approval':
      return walletErrorMessage(error.cause, 'approving the token');
    case 'approval-reverted':
      return 'The approval transaction failed on-chain. Please try again.';
    case 'participation':
      return `Your approval went through (tx ${shortenHash(error.approvalTxHash)}), but we couldn't record your commitment. Please contact support.`;
    default: {
      const _exhaustive: never = error;
      return _exhaustive;
    }
  }
}

/** Maps a classified {@link WalletError} to a user-facing message. */
function walletErrorMessage(cause: WalletError, action: string): string {
  switch (cause.type) {
    case 'user_rejected':
      return 'You rejected the request in your wallet.';
    case 'insufficient_funds':
      return 'Your wallet has insufficient funds to cover the transaction fee.';
    case 'contract_reverted':
      return `The transaction reverted: ${cause.reason}`;
    case 'timeout':
      return 'The transaction is taking longer than expected to confirm. Check your wallet and try again.';
    case 'unknown':
      return `Something went wrong while ${action}. Please try again.`;
    default: {
      const _exhaustive: never = cause;
      return _exhaustive;
    }
  }
}

function shortenHash(hash: string): string {
  return hash.length > 12 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash;
}

/**
 * Maps a typed {@link AmountParseErrorReason} from `parseBlockchainAmount` to a
 * user-facing message. Most of these are already caught by `validateSubmit`;
 * `too-many-decimals` is the one this parse adds on top.
 */
function amountParseErrorMessage(reason: AmountParseErrorReason): string {
  switch (reason.type) {
    case 'empty':
      return 'Please enter an amount.';
    case 'negative':
      return 'Please enter an amount greater than zero.';
    case 'invalid-format':
      return 'Please enter a valid amount.';
    case 'too-many-decimals':
      return `This token supports at most ${reason.maxDecimals} decimal places.`;
    case 'overflow':
      return 'Please enter a smaller amount.';
    default: {
      const _exhaustive: never = reason;
      return _exhaustive;
    }
  }
}
