'use client';

import { useCoinList } from '@coinlist-co/react';
import {
  type AssetId,
  type OfferDetail,
  type OfferId,
  type OfferOption,
  WalletAddress,
} from '@coinlist-co/react/shared';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { erc20Abi, formatEther, parseUnits } from 'viem';
import {
  type Config,
  useBalance,
  useChainId,
  useConfig,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from 'wagmi';
import { useToast } from '@/components/toast/useToast';
import { ETHEREUM_CHAIN } from '@/lib/providers/WalletConnectProvider';
import { ROUTES } from '@/lib/routes';
import {
  assetContract,
  decimals,
  fundingContract,
  USDC,
  USDT,
} from '@/types/coinlist';
import {
  type ContractAddress,
  type Erc20ContractAddress,
  TxHash,
  USDC_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
} from '@/types/erc20';

/**
 * Ethereum mainnet chain ID. The approval transaction must be submitted on
 * this chain regardless of what network the user's wallet is currently on.
 */
const ETHEREUM_MAINNET_CHAIN_ID = 1;

/**
 * Minimum ETH balance required to pay gas for the ERC-20 approve transaction.
 * The approval is an on-chain write and costs gas even though no tokens move.
 */
const MIN_ETH_FOR_GAS = parseUnits('0.001', 18);
const MIN_ETH_FOR_GAS_LABEL = '0.001 ETH';

// ─── Types ────────────────────────────────────────────────────────────────────

export type InvestUiState = {
  backLabel: string;
  endsAt: Date;
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
  const { open: openAppKit } = useAppKit();
  const { address: walletAddress, isConnected } = useAppKitAccount();
  const wagmiConfig = useConfig();
  const chainId = useChainId();
  const { mutateAsync: switchChain } = useSwitchChain();
  const { mutateAsync: disconnect } = useDisconnect();
  const { mutateAsync: writeContract } = useWriteContract();
  const { data: ethBalance } = useBalance({
    address: walletAddress as `0x${string}` | undefined,
    query: { enabled: !!walletAddress },
  });
  const { data: usdcBalanceRaw } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [walletAddress as `0x${string}`],
    query: { enabled: !!walletAddress },
  });
  const { data: usdtBalanceRaw } = useReadContract({
    address: USDT_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [walletAddress as `0x${string}`],
    query: { enabled: !!walletAddress },
  });
  const tokenBalances: Record<AssetId, bigint | undefined> = {
    [USDC]: usdcBalanceRaw,
    [USDT]: usdtBalanceRaw,
  };

  const investAssetId: AssetId = offerDetail.asset.id;

  const [payWithAssetId, setPayWithAssetId] = useState<AssetId | null>(
    offerDetail.fundingAssets[0]?.id ?? null
  );
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
    walletState: deriveWalletState(
      isConnected,
      walletAddress,
      ethBalance?.value
    ),
    fundingAssets: offerDetail.fundingAssets.map((a) => ({
      assetId: a.id,
      code: a.code.toString(),
      balance: formatTokenBalance(tokenBalances[a.id], a.id),
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
    sidebar: deriveSidebar(offerDetail, option, tokenCode),
  };

  const handleSignAndCommit = async () => {
    // Guard: these should be impossible if the UI is wired correctly
    if (!isConnected || !walletAddress || !payWithAssetId) return;

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

    setSubmitState('awaiting_wallet');
    setSubmitError(null);

    try {
      await ensureMainnet(chainId, switchChain);

      const approvalTxHash = await sendApprovalTransaction({
        writeContract,
        wagmiConfig,
        investAssetId,
        payWithAssetId,
        amountInput,
        walletAddress: WalletAddress(walletAddress as `0x${string}`),
        onTransactionSubmitted: () => setSubmitState('confirming_tx'),
      });

      setSubmitState('recording');
      await coinlist.createParticipation({
        offerId,
        offerOptionId: option.id,
        chain: ETHEREUM_CHAIN,
        walletAddress: WalletAddress(walletAddress as `0x${string}`),
        amount: amountInput,
        assetId: payWithAssetId,
        approvalTransactionHash: approvalTxHash,
      });

      setSubmitState('success');
      showToast('Participation recorded', 'success');
      router.push(ROUTES.OFFER_DETAILS(offerId));
    } catch (err: unknown) {
      setSubmitState('error');
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'An error occurred. Please try again.'
      );
    }
  };

  const onEvent = (event: InvestUiEvent) => {
    switch (event.type) {
      case 'ON_BACK_CLICK':
        router.push(ROUTES.OFFER_DETAILS(offerId));
        break;
      case 'ON_CONNECT_WALLET':
        openAppKit();
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

function formatTokenBalance(
  balanceRaw: bigint | undefined,
  assetId: AssetId
): string | null {
  if (balanceRaw === undefined) return null;
  const d = decimals(assetId);
  const value = Number(balanceRaw) / 10 ** d;
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function deriveWalletState(
  isConnected: boolean,
  address: string | undefined,
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
  tokenCode: string
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
    purchaseOptions: offerDetail.fundingAssets
      .map((a) => a.code.toString())
      .join(', '),
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
 * Ensures the user's wallet is on Ethereum mainnet before an on-chain
 * transaction is submitted. If the wallet is on a different chain, this
 * triggers the wallet's native "Switch Network" prompt (e.g. the MetaMask
 * network-switch dialog). Throws if the user rejects the switch.
 */
async function ensureMainnet(
  currentChainId: number,
  switchChain: (params: { chainId: number }) => Promise<unknown>
): Promise<void> {
  if (currentChainId === ETHEREUM_MAINNET_CHAIN_ID) return;
  await switchChain({ chainId: ETHEREUM_MAINNET_CHAIN_ID });
}

/**
 * Submits the ERC-20 approve transaction to the user's wallet (triggering
 * the MetaMask popup) and waits for it to be mined before returning the hash.
 *
 * This does NOT transfer funds. It grants the asset-specific CoinList funding
 * contract (`fundingContract(investAssetId)`) permission to pull up to
 * `amountInput` tokens from the wallet later via transferFrom().
 */
type WriteContractFn = (params: {
  address: Erc20ContractAddress;
  abi: typeof erc20Abi;
  functionName: 'approve';
  args: readonly [ContractAddress, bigint];
}) => Promise<`0x${string}`>;

async function sendApprovalTransaction({
  writeContract,
  wagmiConfig,
  investAssetId,
  payWithAssetId,
  amountInput,
  walletAddress,
  onTransactionSubmitted,
}: {
  writeContract: WriteContractFn;
  wagmiConfig: Config;
  investAssetId: AssetId;
  payWithAssetId: AssetId;
  amountInput: string;
  walletAddress: WalletAddress;
  onTransactionSubmitted: () => void;
}): Promise<TxHash> {
  const tokenContract = assetContract(payWithAssetId);
  const spender = fundingContract(investAssetId);
  const approvalAmount = parseUnits(
    amountInput.trim(),
    decimals(payWithAssetId)
  );

  // Some tokens (notably USDT) revert if you try to change a non-zero
  // allowance to another non-zero value. Reset to 0 first when needed.
  const currentAllowance = await readContract(wagmiConfig, {
    address: tokenContract,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [walletAddress as `0x${string}`, spender],
  });
  if (currentAllowance > BigInt(0)) {
    const resetTxHash = await writeContract({
      address: tokenContract,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, BigInt(0)],
    });
    await waitForTransactionReceipt(wagmiConfig, { hash: resetTxHash });
  }

  // This call opens the MetaMask (or other wallet) popup. The user must
  // confirm before the promise resolves with the transaction hash.
  const txHash = await writeContract({
    address: tokenContract,
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender, approvalAmount],
  });

  // Wallet confirmed — transaction is now broadcast. Signal the caller so the
  // UI can update to "waiting for block confirmation" before we poll the chain.
  onTransactionSubmitted();

  // Wait until the approval is included in a block. The CoinList backend
  // verifies on-chain that the allowance exists before recording the
  // participation, so we must confirm before calling createParticipation.
  await waitForTransactionReceipt(wagmiConfig, { hash: txHash });

  return TxHash(txHash);
}
