'use client';

import {
  type SwapExecutionError,
  type SwapExecutionPhase,
  type SwapExecutionResult,
  useCoinList,
  useSwapOutputToken,
  useSwapQuote,
  useSwapTokenBalances,
  type WalletAuthorizationError,
  type WalletAuthorizationPhase,
  type WalletError,
} from '@coinlist-co/react';
import {
  assetAmount,
  BlockchainAmount,
  type Bps,
  computeSlip,
  DEFAULT_AMOUNT_TO_COMPUTE_PRICE,
  DEFAULT_SLIPPAGE_BPS,
  type Erc20Asset,
  EvmWalletAddress,
  formatAmount,
  formatBpsAsPercent,
  formatRawAmount,
  formattedPricePerShare,
  formattedUsdPrice,
  getNetworkName,
  type OfferDetail,
  parseBlockchainAmount,
  SLIPPAGE_OPTIONS_BPS,
  SUPERSTATE_TOS_URL,
  shortenAddress,
  txExplorerUrl,
  usdAmount,
} from '@coinlist-co/react/shared';
import { useEffect, useState } from 'react';
import { useConfig, useWalletClient } from 'wagmi';
import {
  INPUT_ERC20,
  INPUT_SYMBOL,
  INPUT_TOKEN_ADDRESS,
  ISSUER_NAME,
  LOCALE,
  SWAP_CHAIN,
  SWAP_CONTRACT_ADDRESS,
} from '@/features/swap/constants';
import { buildEvmWallet } from '@/features/swap/wagmiEvmWallet';
import { useEvmWallet } from '@/lib/evm-wallet';

// ─── Types ──────────────────────────────────────────────────────────────────

export type SwapStep = 'authorize' | 'amount' | 'review';

export type StepStatus = 'inactive' | 'active' | 'completed';

export type SlippageOptionUi = {
  bps: Bps;
  label: string;
  selected: boolean;
};

export type ReviewRowsUi = {
  subtotal: string;
  fee: string;
  total: string;
  youReceive: string;
  minReceived: string;
  pricePerShare: string;
  recipient: string;
};

export type OrderConfirmedUi = {
  tokenName: string;
  issuer: string;
  totalCost: string;
  sharesReceived: string;
  pricePerShare: string;
  recipient: string;
  explorerUrl: string;
};

export type SwapUiState =
  | { type: 'ERROR' }
  | {
      type: 'CONTENT';
      step: SwapStep;
      endsAt: Date;
      authorize: {
        status: StepStatus;
        connectedAddress: string | null;
        confirmedAddress: string | null;
        busyLabel: string | null;
        error: string | null;
        canConfirm: boolean;
      };
      amount: {
        status: StepStatus;
        input: string;
        balanceLabel: string | null;
        minPurchaseLabel: string | null;
        summary: string | null;
        error: string | null;
        canContinue: boolean;
      };
      review: {
        status: StepStatus;
        quoteLoading: boolean;
        rows: ReviewRowsUi | null;
        slippageOptions: SlippageOptionUi[];
        tosUrl: string;
        busyLabel: string | null;
        error: string | null;
        canPlaceOrder: boolean;
      };
      sidebar: {
        tokenName: string;
        tokenSymbol: string;
        issuer: string;
        pricePerShare: string;
        network: string;
        acceptedAsset: string;
        minPurchase: string | null;
      };
      confirmedOrder: OrderConfirmedUi | null;
    };

export type SwapContentState = Extract<SwapUiState, { type: 'CONTENT' }>;
export type AuthorizeUi = SwapContentState['authorize'];
export type AmountUi = SwapContentState['amount'];
export type ReviewUi = SwapContentState['review'];
export type SidebarUi = SwapContentState['sidebar'];

export type SwapUiEvent =
  | { type: 'ON_BACK' }
  | { type: 'ON_CONNECT_WALLET' }
  | { type: 'ON_DISCONNECT_WALLET' }
  | { type: 'ON_CONFIRM_WALLET' }
  | { type: 'ON_EDIT_AUTHORIZE' }
  | { type: 'ON_AMOUNT_CHANGE'; value: string }
  | { type: 'ON_MAX_CLICK' }
  | { type: 'ON_PREVIEW_ORDER' }
  | { type: 'ON_EDIT_AMOUNT' }
  | { type: 'ON_SLIPPAGE_SELECT'; bps: Bps }
  | { type: 'ON_PLACE_ORDER' }
  | { type: 'ON_CLOSE_CONFIRMED' };

type Pending =
  | { kind: 'authorize'; phase: WalletAuthorizationPhase }
  | { kind: 'swap'; phase: SwapExecutionPhase };

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSwapViewModel({
  offerDetail,
  onBack,
}: {
  offerDetail: OfferDetail;
  onBack: () => void;
}): { state: SwapUiState; onEvent: (event: SwapUiEvent) => void } {
  const { coinlist, isReady } = useCoinList();
  // The swap runs on SWAP_CHAIN, so its wallet lifecycle (connect, disconnect,
  // account state) routes through the seam on that chain rather than reaching
  // for AppKit/wagmi directly. The on-chain writes below still use walletClient
  // and config, which the seam deliberately leaves to the host.
  const { address, isConnected, connect, disconnect } =
    useEvmWallet(SWAP_CHAIN);
  const { data: walletClient } = useWalletClient();
  const config = useConfig();

  const [step, setStep] = useState<SwapStep>('authorize');
  const [authorizedAddress, setAuthorizedAddress] =
    useState<EvmWalletAddress | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [confirmedAmount, setConfirmedAmount] =
    useState<BlockchainAmount | null>(null);
  const [slippageBps, setSlippageBps] = useState<Bps>(DEFAULT_SLIPPAGE_BPS);
  const [pending, setPending] = useState<Pending | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmedUi | null>(
    null
  );

  // The output token (the fund share the contract pays out) drives quoting and
  // all output-side formatting. A failure here means the flow cannot function.
  const { outputTokenState } = useSwapOutputToken({
    contractAddress: SWAP_CONTRACT_ADDRESS,
    chain: SWAP_CHAIN,
    enabled: true,
  });
  const outputToken: Erc20Asset | null =
    outputTokenState.type === 'CONTENT' ? outputTokenState.outputToken : null;
  const outputTokenDecimals = outputToken?.decimals ?? null;

  // A $1 probe quote gives the sidebar a price-per-share before the user has
  // entered an amount. Once they confirm an amount, we quote that instead. Only
  // one of the two is enabled at a time, so a single poll runs.
  const probeAmount = BlockchainAmount({
    raw: DEFAULT_AMOUNT_TO_COMPUTE_PRICE,
    decimals: INPUT_ERC20.decimals,
  });
  const probeQuote = useSwapQuote({
    contractAddress: SWAP_CONTRACT_ADDRESS,
    chain: SWAP_CHAIN,
    inputAmount: probeAmount,
    inputTokenAddress: INPUT_TOKEN_ADDRESS,
    outputTokenDecimals,
    enabled: confirmedAmount === null,
  });
  const orderQuote = useSwapQuote({
    contractAddress: SWAP_CONTRACT_ADDRESS,
    chain: SWAP_CHAIN,
    inputAmount: confirmedAmount ?? probeAmount,
    inputTokenAddress: INPUT_TOKEN_ADDRESS,
    outputTokenDecimals,
    enabled: confirmedAmount !== null,
  });
  const activeQuote =
    confirmedAmount === null ? probeQuote.quote : orderQuote.quote;

  const { balances, isLoading: balancesLoading } = useSwapTokenBalances({
    address: address ?? EvmWalletAddress(ZERO_ADDRESS),
    chain: SWAP_CHAIN,
    assets: [INPUT_SYMBOL],
    enabled: isConnected && !!address,
  });
  const inputBalance = balances.get(INPUT_SYMBOL) ?? null;

  // If the connected account changes (or disconnects) after authorizing, the
  // prior authorization no longer applies — restart from the authorize step.
  useEffect(() => {
    if (authorizedAddress && address !== authorizedAddress) {
      setAuthorizedAddress(null);
      setConfirmedAmount(null);
      setStep('authorize');
    }
  }, [address, authorizedAddress]);

  const minimumPurchaseUsd = offerDetail.options[0]?.minimumPurchaseUsd ?? null;
  const busy = pending !== null;

  const handleConfirmWallet = async () => {
    if (!isReady || !walletClient || !address) return;
    setActionError(null);
    setPending({ kind: 'authorize', phase: 'checking-authorization' });
    try {
      const wallet = buildEvmWallet({
        address,
        walletClient,
        config,
      });
      const result = await coinlist.swap.authorizeWallet({
        wallet,
        offerId: offerDetail.id,
        contractAddress: SWAP_CONTRACT_ADDRESS,
        chain: SWAP_CHAIN,
        onProgress: (phase) => setPending({ kind: 'authorize', phase }),
      });
      if (result.type === 'success') {
        setAuthorizedAddress(address);
        setStep('amount');
      } else {
        setActionError(authErrorMessage(result.error));
      }
    } catch {
      setActionError(GENERIC_ERROR);
    } finally {
      setPending(null);
    }
  };

  const handlePreviewOrder = () => {
    const parsed = parseBlockchainAmount(amountInput, INPUT_ERC20.decimals);
    if (!parsed.valid || parsed.amount.raw === BigInt(0)) {
      setAmountError('Enter an amount greater than zero.');
      return;
    }
    if (
      minimumPurchaseUsd !== null &&
      parsed.amount.raw < minimumRaw(minimumPurchaseUsd)
    ) {
      setAmountError(
        `Minimum purchase is $${minimumPurchaseUsd.toLocaleString(LOCALE)}.`
      );
      return;
    }
    if (inputBalance !== null && parsed.amount.raw > inputBalance) {
      setAmountError(`Insufficient ${INPUT_ERC20.symbol} balance.`);
      return;
    }
    setAmountError(null);
    setConfirmedAmount(parsed.amount);
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    const quote = orderQuote.quote;
    if (!isReady || !walletClient || !address || !quote || !outputToken) return;
    setActionError(null);
    setPending({ kind: 'swap', phase: 'checking-status' });
    try {
      const wallet = buildEvmWallet({
        address,
        walletClient,
        config,
      });
      const result = await coinlist.swap.executeSwap({
        wallet,
        contractAddress: SWAP_CONTRACT_ADDRESS,
        chain: SWAP_CHAIN,
        inputTokenAddress: INPUT_TOKEN_ADDRESS,
        quote,
        slippageBps,
        onProgress: (phase) => setPending({ kind: 'swap', phase }),
      });
      if (result.type === 'success') {
        setConfirmedOrder(buildOrderConfirmed(result, outputToken));
      } else {
        setActionError(swapErrorMessage(result.error));
      }
    } catch {
      setActionError(GENERIC_ERROR);
    } finally {
      setPending(null);
    }
  };

  const onEvent = (event: SwapUiEvent) => {
    switch (event.type) {
      case 'ON_BACK':
        onBack();
        break;
      case 'ON_CONNECT_WALLET':
        connect();
        break;
      case 'ON_DISCONNECT_WALLET':
        // A failing disconnect (not rare with WalletConnect sessions) would
        // otherwise surface as an unhandled rejection. Nothing to recover here
        // beyond swallowing it — the wallet stays connected and the user can
        // retry.
        void disconnect().catch(() => {});
        break;
      case 'ON_CONFIRM_WALLET':
        void handleConfirmWallet();
        break;
      case 'ON_EDIT_AUTHORIZE':
        setStep('authorize');
        break;
      case 'ON_AMOUNT_CHANGE':
        if (event.value === '' || /^\d*\.?\d*$/.test(event.value)) {
          setAmountInput(event.value);
          setAmountError(null);
        }
        break;
      case 'ON_MAX_CLICK':
        if (inputBalance !== null) {
          setAmountInput(
            formatRawAmount(
              BlockchainAmount({
                raw: inputBalance,
                decimals: INPUT_ERC20.decimals,
              })
            )
          );
          setAmountError(null);
        }
        break;
      case 'ON_PREVIEW_ORDER':
        handlePreviewOrder();
        break;
      case 'ON_EDIT_AMOUNT':
        setConfirmedAmount(null);
        setStep('amount');
        break;
      case 'ON_SLIPPAGE_SELECT':
        setSlippageBps(event.bps);
        break;
      case 'ON_PLACE_ORDER':
        void handlePlaceOrder();
        break;
      case 'ON_CLOSE_CONFIRMED':
        setConfirmedOrder(null);
        onBack();
        break;
    }
  };

  if (outputTokenState.type === 'ERROR') {
    return { state: { type: 'ERROR' }, onEvent };
  }

  const recipientAddress = authorizedAddress ?? address;

  // A quote should never ask for more input than the user committed to. If it
  // does, it's stale — left over from a previous amount, or a silently failed
  // refetch (the SDK swallows the error and clears `isRefreshing`, leaving the
  // old quote live). Blank the figures and block the order in that case rather
  // than placing an order for the wrong amount. A quote for *less* is a
  // legitimate partial fill and stays allowed. `executeSwap` spends whatever
  // the quote says with no requested amount to check against, so this guard is
  // the only backstop.
  const quoteAsksForMore =
    confirmedAmount !== null &&
    orderQuote.quote !== null &&
    BlockchainAmount.add(
      orderQuote.quote.inputTokenAmount,
      orderQuote.quote.fee
    ).raw > confirmedAmount.raw;

  const rows: ReviewRowsUi | null =
    orderQuote.quote && outputToken && recipientAddress && !quoteAsksForMore
      ? {
          // "Subtotal" is the amount that actually buys shares; the CoinList fee
          // is charged on top. The wallet is debited the sum of the two, so the
          // "Total" below is the real cost the user pays.
          subtotal: assetAmount(
            formatAmount(orderQuote.quote.inputTokenAmount, LOCALE),
            INPUT_ERC20.symbol
          ),
          fee: assetAmount(
            formatAmount(orderQuote.quote.fee, LOCALE),
            INPUT_ERC20.symbol
          ),
          total: assetAmount(
            formatAmount(
              BlockchainAmount.add(
                orderQuote.quote.inputTokenAmount,
                orderQuote.quote.fee
              ),
              LOCALE
            ),
            INPUT_ERC20.symbol
          ),
          youReceive: assetAmount(
            formatAmount(orderQuote.quote.outputTokenAmount, LOCALE),
            outputToken.symbol
          ),
          minReceived: assetAmount(
            formatAmount(
              computeSlip(orderQuote.quote.outputTokenAmount, slippageBps),
              LOCALE
            ),
            outputToken.symbol
          ),
          pricePerShare: formattedPricePerShare(orderQuote.quote, LOCALE),
          recipient: shortenAddress(recipientAddress),
        }
      : null;

  const state: SwapUiState = {
    type: 'CONTENT',
    step,
    endsAt: offerDetail.endsAt,
    authorize: {
      status: step === 'authorize' ? 'active' : 'completed',
      connectedAddress: isConnected && address ? shortenAddress(address) : null,
      confirmedAddress: authorizedAddress
        ? shortenAddress(authorizedAddress)
        : null,
      busyLabel:
        pending?.kind === 'authorize' ? authPhaseLabel(pending.phase) : null,
      error:
        pending?.kind === 'authorize' || step === 'authorize'
          ? actionError
          : null,
      canConfirm:
        isReady && isConnected && !!address && !!walletClient && !busy,
    },
    amount: {
      status:
        step === 'amount'
          ? 'active'
          : step === 'review'
            ? 'completed'
            : 'inactive',
      input: amountInput,
      balanceLabel:
        inputBalance !== null
          ? `${formatAmount(
              BlockchainAmount({
                raw: inputBalance,
                decimals: INPUT_ERC20.decimals,
              }),
              LOCALE
            )} ${INPUT_ERC20.symbol}`
          : null,
      minPurchaseLabel:
        minimumPurchaseUsd !== null
          ? `Minimum purchase: $${minimumPurchaseUsd.toLocaleString(LOCALE)}`
          : null,
      summary: confirmedAmount
        ? assetAmount(formatAmount(confirmedAmount, LOCALE), INPUT_ERC20.symbol)
        : null,
      error: amountError,
      // Gate on balances still loading: the insufficient-funds check in
      // handlePreviewOrder only runs once inputBalance is known, so a slow or
      // hanging RPC read would otherwise let the user continue past a balance
      // we haven't verified yet.
      canContinue: amountInput.trim().length > 0 && !busy && !balancesLoading,
    },
    review: {
      status: step === 'review' ? 'active' : 'inactive',
      quoteLoading: orderQuote.isLoading || !outputToken,
      rows,
      slippageOptions: SLIPPAGE_OPTIONS_BPS.map((bps) => ({
        bps,
        label: formatBpsAsPercent(bps, LOCALE),
        selected: bps === slippageBps,
      })),
      tosUrl: SUPERSTATE_TOS_URL,
      busyLabel:
        pending?.kind === 'swap' ? swapPhaseLabel(pending.phase) : null,
      error: pending?.kind === 'swap' || step === 'review' ? actionError : null,
      canPlaceOrder:
        isReady &&
        isConnected &&
        !!address &&
        !!walletClient &&
        !!orderQuote.quote &&
        !quoteAsksForMore &&
        !busy,
    },
    sidebar: {
      tokenName: outputToken?.name ?? offerDetail.name,
      tokenSymbol: outputToken?.symbol ?? offerDetail.asset.code,
      issuer: ISSUER_NAME,
      pricePerShare: formattedPricePerShare(activeQuote, LOCALE),
      network: getNetworkName(SWAP_CHAIN),
      acceptedAsset: INPUT_ERC20.symbol,
      minPurchase:
        minimumPurchaseUsd !== null
          ? `$${minimumPurchaseUsd.toLocaleString(LOCALE)}`
          : null,
    },
    confirmedOrder,
  };

  return { state, onEvent };
}

// ─── Private helpers ──────────────────────────────────────────────────────────

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const GENERIC_ERROR = 'Something went wrong. Please try again.';

function minimumRaw(minimumPurchaseUsd: number): bigint {
  return BigInt(Math.round(minimumPurchaseUsd * 10 ** INPUT_ERC20.decimals));
}

function buildOrderConfirmed(
  result: Extract<SwapExecutionResult, { type: 'success' }>,
  outputToken: Erc20Asset
): OrderConfirmedUi {
  return {
    tokenName: outputToken.name,
    issuer: ISSUER_NAME,
    // The wallet is debited the swapped amount plus the CoinList fee, so the
    // total cost is their sum — not `inputAmount` alone, which excludes the fee.
    totalCost: usdAmount(
      formatAmount(BlockchainAmount.add(result.inputAmount, result.fee), LOCALE)
    ),
    sharesReceived: assetAmount(
      formatAmount(result.outputAmount, LOCALE),
      outputToken.symbol
    ),
    pricePerShare: formattedUsdPrice(result.pricePerShare, LOCALE),
    recipient: shortenAddress(result.recipientAddress),
    explorerUrl: txExplorerUrl(SWAP_CHAIN, result.swapTxHash),
  };
}

function authPhaseLabel(phase: WalletAuthorizationPhase): string {
  switch (phase) {
    case 'checking-authorization':
      return 'Checking authorization…';
    case 'requesting-challenge':
      return 'Requesting signature…';
    case 'signing-message':
      return 'Sign the message in your wallet…';
    case 'submitting-signature':
      return 'Submitting signature…';
    case 'broadcasting-transaction':
      return 'Confirm the transaction in your wallet…';
    case 'awaiting-confirmation':
      return 'Waiting for confirmation…';
    case 'verifying-authorization':
      return 'Verifying authorization…';
  }
}

function swapPhaseLabel(phase: SwapExecutionPhase): string {
  switch (phase) {
    case 'checking-status':
      return 'Checking swap status…';
    case 'checking-allowance':
      return 'Checking allowance…';
    case 'resetting-allowance':
      return 'Reset allowance in your wallet…';
    case 'confirming-allowance-reset':
      return 'Confirming allowance reset…';
    case 'approving':
      return `Approve ${INPUT_ERC20.symbol} in your wallet…`;
    case 'confirming-approval':
      return 'Confirming approval…';
    case 'swapping':
      return 'Confirm the swap in your wallet…';
    case 'confirming-swap':
      return 'Confirming swap…';
  }
}

function walletErrorMessage(error: WalletError): string {
  switch (error.type) {
    case 'user_rejected':
      return 'Request was rejected in your wallet.';
    case 'insufficient_funds':
      return 'Insufficient funds to cover gas.';
    case 'contract_reverted':
      return `Transaction reverted: ${error.reason}`;
    case 'timeout':
      return 'Timed out waiting for the transaction.';
    case 'unknown':
      return GENERIC_ERROR;
  }
}

function authErrorMessage(error: WalletAuthorizationError): string {
  switch (error.step) {
    case 'authorization-check':
      return 'Could not check wallet authorization. Please try again.';
    case 'challenge-request':
      return 'Could not request a signature challenge. Please try again.';
    case 'signing':
      return walletErrorMessage(error.cause);
    case 'allow-wallet':
      return 'Could not authorize this wallet for the offer.';
    case 'broadcast':
      return walletErrorMessage(error.cause);
    case 'not-authorized':
      return 'Wallet authorization could not be verified.';
  }
}

function swapErrorMessage(error: SwapExecutionError): string {
  switch (error.step) {
    case 'status-check':
      return 'Could not check swap status. Please try again.';
    case 'swap-stopped':
      return 'Swaps are temporarily paused. Please try again later.';
    case 'allowance-check':
      return 'Could not check your token allowance. Please try again.';
    case 'approval':
      return walletErrorMessage(error.cause);
    case 'approval-reverted':
      return 'The approval transaction reverted.';
    case 'swap':
      return walletErrorMessage(error.cause);
    case 'swap-reverted':
      return 'The swap transaction reverted.';
  }
}
