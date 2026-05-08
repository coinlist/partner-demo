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
import { erc20Abi, parseUnits } from 'viem';
import { useConfig, useDisconnect, useWriteContract } from 'wagmi';
import { ETHEREUM_CHAIN } from '@/lib/providers/WalletConnectProvider';
import { ROUTES } from '@/lib/routes';

// TODO: Replace with the actual CoinList contract address that receives ERC-20 approvals
const COINLIST_SPENDER_ADDRESS =
  '0x0000000000000000000000000000000000000000' as const;

// TODO: Replace with actual on-chain contract addresses for each supported asset
// Key is the CoinList assetId string, value is the ERC-20 contract address on Ethereum mainnet
const ASSET_CONTRACT_ADDRESS: Record<string, `0x${string}`> = {
  // 'usdc-asset-id': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  // 'usdt-asset-id': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
};

// TODO: Replace with actual decimals per asset (USDC = 6, USDT = 6, DAI = 18)
const ASSET_DECIMALS: Record<string, number> = {
  // 'usdc-asset-id': 6,
  // 'usdt-asset-id': 6,
};

const DEFAULT_ASSET_DECIMALS = 6;

export type InvestUiState = {
  backLabel: string;
  endsAt: Date;
  walletState:
    | { type: 'DISCONNECTED' }
    | { type: 'CONNECTED'; truncatedAddress: string };
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

export function useInvestViewModel(
  offerDetail: OfferDetail,
  option: OfferOption
): { state: InvestUiState; onEvent: (event: InvestUiEvent) => void } {
  const router = useRouter();
  const { coinlist } = useCoinList();
  const { open: openAppKit } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const wagmiConfig = useConfig();
  const { disconnect } = useDisconnect();
  const { mutateAsync: approveErc20 } = useWriteContract();

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

  const walletState: InvestUiState['walletState'] =
    isConnected && address
      ? {
          type: 'CONNECTED',
          truncatedAddress:
            address.length > 10
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : address,
        }
      : { type: 'DISCONNECTED' };

  const tokenEquivalent: string | null = (() => {
    if (!amountInput || !option.priceUsd) return null;
    const amount = parseFloat(amountInput);
    const price = parseFloat(option.priceUsd);
    if (Number.isNaN(amount) || Number.isNaN(price) || price === 0) return null;
    return `≈ ${(amount / price).toLocaleString()} ${tokenCode}`;
  })();

  const sidebar: InvestUiState['sidebar'] = {
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

  const state: InvestUiState = {
    backLabel: 'Back to deal page',
    endsAt: offerDetail.endsAt,
    walletState,
    fundingAssets: offerDetail.fundingAssets.map((a) => ({
      assetId: a.id,
      code: a.code.toString(),
    })),
    selectedAssetId,
    amountInput,
    tokenEquivalent,
    saleAgreementUrl: option.saleAgreementUrl,
    submitState,
    submitError,
    sidebar,
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
        break;
      case 'ON_AMOUNT_CHANGE':
        setAmountInput(event.value);
        break;
      case 'ON_SIGN_AND_COMMIT':
        if (walletState.type !== 'CONNECTED' || !selectedAssetId || !address)
          break;
        setSubmitState('submitting');
        setSubmitError(null);
        (async () => {
          try {
            const assetIdStr = selectedAssetId.toString();
            const tokenAddress = ASSET_CONTRACT_ADDRESS[assetIdStr];
            const decimals =
              ASSET_DECIMALS[assetIdStr] ?? DEFAULT_ASSET_DECIMALS;

            if (!tokenAddress) {
              throw new Error(
                `No contract address configured for asset ${assetIdStr}`
              );
            }

            const approvalAmount = parseUnits(amountInput, decimals);

            const approvalTxHash = await approveErc20({
              address: tokenAddress,
              abi: erc20Abi,
              functionName: 'approve',
              args: [COINLIST_SPENDER_ADDRESS, approvalAmount],
            });

            await waitForTransactionReceipt(wagmiConfig, {
              hash: approvalTxHash,
            });

            await coinlist.createParticipation({
              offerId,
              offerOptionId: option.id,
              chain: ETHEREUM_CHAIN,
              walletAddress: WalletAddress(address),
              amount: amountInput,
              assetId: selectedAssetId,
              approvalTransactionHash: approvalTxHash,
            });

            router.push(ROUTES.OFFER_DETAILS(offerId));
          } catch (err: unknown) {
            setSubmitState('error');
            setSubmitError(
              err instanceof Error
                ? err.message
                : 'An error occurred. Please try again.'
            );
          }
        })();
        break;
    }
  };

  return { state, onEvent };
}
