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
import { waitForTransactionReceipt } from '@wagmi/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { erc20Abi, formatEther, parseUnits } from 'viem';
import {
  type Config,
  useBalance,
  useChainId,
  useConfig,
  useDisconnect,
  useSwitchChain,
  useWriteContract,
} from 'wagmi';
import { ETHEREUM_CHAIN } from '@/lib/providers/WalletConnectProvider';
import { ROUTES } from '@/lib/routes';

// ─── Configuration ────────────────────────────────────────────────────────────

/**
 * Funding contract: The CoinList smart contract that receives ERC-20 approvals for this offer.
 *
 * When a user invests, their wallet signs an ERC-20 approve(spender, amount)
 * transaction giving this contract permission to later pull their funds via
 * transferFrom(). No money moves at signing time — the user is only granting
 * an allowance. CoinList collects the funds when the offer closes.
 *
 * This address is offer-specific and provided by CoinList when the offer is
 * set up. You can find it in the raw offer API response under the `contracts`
 * array, in the entry where action === "funding" on the Ethereum chain.
 *
 * TODO: Replace with the actual funding contract address for your offer.
 *
 * TESTING: The address below is a dummy used for local testing only. It is a
 * valid Ethereum address with no deployed code, so the ERC-20 approve() call
 * will succeed on-chain and MetaMask will show the real signing flow, but the
 * CoinList backend will reject createParticipation because it won't find an
 * allowance on its real contract. Replace before going live.
 */
const COINLIST_SPENDER_ADDRESS =
  '0xc671659c6dD68f1339e8aA9dbf633ec23589f16a' as `0x${string}`;

/**
 * ERC-20 contract addresses on Ethereum mainnet, keyed by CoinList asset ID.
 *
 * The asset ID is the `id` field on each entry in OfferDetail.fundingAssets,
 * and corresponds to `generic_token_id` in the backend API. To find the ID
 * for an asset you want to support, inspect the `fundingAssets` array on
 * the offer detail response.
 *
 * Add entries here for any additional funding assets your offer supports.
 */
const ASSET_CONTRACT_ADDRESS: Record<string, `0x${string}`> = {
  'usd-coin': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '2dc8ccb2-d36d-43bb-894e-d45022418d51':
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
};

/**
 * Token decimal places, keyed by CoinList asset ID. Used to convert a
 * human-readable amount (e.g. "1000") to the raw integer the EVM expects
 * (e.g. 1_000_000 for USDC which has 6 decimals, not 18 like ETH).
 */
const ASSET_DECIMALS: Record<string, number> = {
  'usd-coin': 6, // USDC
  '2dc8ccb2-d36d-43bb-894e-d45022418d51': 6, // USDT
};

const DEFAULT_ASSET_DECIMALS = 6;

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
  fundingAssets: { assetId: AssetId; code: string }[];
  selectedAssetId: AssetId | null;
  amountInput: string;
  tokenEquivalent: string | null;
  saleAgreementUrl: string | null;
  submitState: 'idle' | 'submitting' | 'error' | 'success';
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
  const { open: openAppKit } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const wagmiConfig = useConfig();
  const chainId = useChainId();
  const { mutateAsync: switchChain } = useSwitchChain();
  const { mutateAsync: disconnect } = useDisconnect();
  const { mutateAsync: writeContract } = useWriteContract();
  const { data: ethBalance } = useBalance({
    address: address as `0x${string}` | undefined,
    query: { enabled: !!address },
  });

  const [selectedAssetId, setSelectedAssetId] = useState<AssetId | null>(
    offerDetail.fundingAssets[0]?.id ?? null
  );
  const [amountInput, setAmountInput] = useState('');
  const [submitState, setSubmitState] = useState<
    'idle' | 'submitting' | 'error' | 'success'
  >('idle');
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
    fundingAssets: offerDetail.fundingAssets.map((a) => ({
      assetId: a.id,
      code: a.code.toString(),
    })),
    selectedAssetId,
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
    if (!isConnected || !address || !selectedAssetId) return;

    const validationError = validateSubmit(
      amountInput,
      selectedAssetId,
      ethBalance?.value
    );
    if (validationError) {
      setSubmitState('error');
      setSubmitError(validationError);
      return;
    }

    setSubmitState('submitting');
    setSubmitError(null);

    try {
      await ensureMainnet(chainId, switchChain);

      const approvalTxHash = await sendApprovalTransaction(
        writeContract,
        wagmiConfig,
        selectedAssetId,
        amountInput
      );

      await coinlist.createParticipation({
        offerId,
        offerOptionId: option.id,
        chain: ETHEREUM_CHAIN,
        walletAddress: WalletAddress(address),
        amount: amountInput,
        assetId: selectedAssetId,
        approvalTransactionHash: approvalTxHash,
      });

      setSubmitState('success');
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
        disconnect();
        break;
      case 'ON_ASSET_SELECT':
        setSelectedAssetId(event.assetId);
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
function validateSubmit(
  amountInput: string,
  selectedAssetId: AssetId,
  ethBalanceWei: bigint | undefined
): string | null {
  // Catch misconfiguration early so devs see a clear error instead of a
  // silent on-chain approval to the zero address.
  if (
    COINLIST_SPENDER_ADDRESS === '0x0000000000000000000000000000000000000000'
  ) {
    return 'COINLIST_SPENDER_ADDRESS is not configured. Set the funding contract address in useInvestViewModel.tsx.';
  }

  const assetIdStr = selectedAssetId.toString();
  if (!ASSET_CONTRACT_ADDRESS[assetIdStr]) {
    return `Asset "${assetIdStr}" has no configured ERC-20 contract address. Add it to ASSET_CONTRACT_ADDRESS in useInvestViewModel.tsx.`;
  }

  const amount = parseFloat(amountInput.trim());
  if (!amountInput.trim() || Number.isNaN(amount) || amount <= 0) {
    return 'Please enter a valid amount greater than zero.';
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
 * This does NOT transfer funds. It grants COINLIST_SPENDER_ADDRESS permission
 * to pull up to `amountInput` tokens from the wallet later via transferFrom().
 */
async function sendApprovalTransaction(
  writeContract: (params: {
    address: `0x${string}`;
    abi: typeof erc20Abi;
    functionName: 'approve';
    args: readonly [`0x${string}`, bigint];
  }) => Promise<`0x${string}`>,
  wagmiConfig: Config,
  selectedAssetId: AssetId,
  amountInput: string
): Promise<`0x${string}`> {
  const assetIdStr = selectedAssetId.toString();
  const tokenAddress = ASSET_CONTRACT_ADDRESS[assetIdStr];
  const decimals = ASSET_DECIMALS[assetIdStr] ?? DEFAULT_ASSET_DECIMALS;

  // This should have been caught by validateSubmit, but guard anyway.
  if (!tokenAddress) {
    throw new Error(
      `No ERC-20 contract address configured for asset "${assetIdStr}".`
    );
  }

  const approvalAmount = parseUnits(amountInput.trim(), decimals);

  // This call opens the MetaMask (or other wallet) popup. The user must
  // confirm before the promise resolves with the transaction hash.
  const txHash = await writeContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'approve',
    args: [COINLIST_SPENDER_ADDRESS, approvalAmount],
  });

  // Wait until the approval is included in a block. The CoinList backend
  // verifies on-chain that the allowance exists before recording the
  // participation, so we must confirm before calling createParticipation.
  await waitForTransactionReceipt(wagmiConfig, { hash: txHash });

  return txHash;
}
