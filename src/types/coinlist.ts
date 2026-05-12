import { AssetId } from '@coinlist-co/react/shared';
import {
  type Erc20ContractAddress,
  USDC_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
} from '@/types/erc20';

export const USDC = AssetId('usd-coin');
export const USDT = AssetId('2dc8ccb2-d36d-43bb-894e-d45022418d51');

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
export const ASSET_CONTRACT_ADDRESS: Record<AssetId, Erc20ContractAddress> = {
  [USDC]: USDC_CONTRACT_ADDRESS,
  [USDT]: USDT_CONTRACT_ADDRESS,
};

/**
 * Token decimal places, keyed by CoinList asset ID. Used to convert a
 * human-readable amount (e.g. "1000") to the raw integer the EVM expects
 * (e.g. 1_000_000 for USDC which has 6 decimals, not 18 like ETH).
 */
export const ASSET_DECIMALS: Record<AssetId, number> = {
  [USDC]: 6,
  [USDT]: 6,
};

export function decimals(asset: AssetId): number {
  const d = ASSET_DECIMALS[asset];
  if (d === undefined) {
    throw new Error(`No decimals configured for asset: '${asset}'`);
  }
  return d;
}
