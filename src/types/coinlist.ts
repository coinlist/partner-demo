import { AssetId } from '@coinlist-co/react/shared';
import {
  ContractAddress,
  type Erc20ContractAddress,
  USDC_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
} from '@/types/erc20';

export const USDC = AssetId('usd-coin');
export const USDT = AssetId('2dc8ccb2-d36d-43bb-894e-d45022418d51');
export const TEST_ASSET = AssetId('n2p22foyyqqfksa83lmjpiwu');
export const ZAMA_TEST = AssetId('2dc8ccb2-d36d-43bb-894e-d45022418d51');

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
const ASSET_CONTRACT_ADDRESS: Record<AssetId, Erc20ContractAddress> = {
  [USDC]: USDC_CONTRACT_ADDRESS,
  [USDT]: USDT_CONTRACT_ADDRESS,
};

export function assetContract(asset: AssetId): Erc20ContractAddress {
  const c = ASSET_CONTRACT_ADDRESS[asset];
  if (!c) {
    throw new Error(
      `No ASSET_CONTRACT_ADDRESS configured for asset: "${asset}"`
    );
  }
  return c;
}

/**
 * Token decimal places, keyed by CoinList asset ID. Used to convert a
 * human-readable amount (e.g. "1000") to the raw integer the EVM expects
 * (e.g. 1_000_000 for USDC which has 6 decimals, not 18 like ETH).
 */
const ASSET_DECIMALS: Record<AssetId, number> = {
  [USDC]: 6,
  [USDT]: 6,
};

export function decimals(asset: AssetId): number {
  const d = ASSET_DECIMALS[asset];
  if (d === undefined) {
    throw new Error(`No ASSET_DECIMALS configured for asset: "${asset}"`);
  }
  return d;
}

const FUNDING_CONTRACT_ADDRESS: Record<AssetId, ContractAddress> = {
  [TEST_ASSET]: ContractAddress('0xc671659c6dD68f1339e8aA9dbf633ec23589f16a'),
  [ZAMA_TEST]: ContractAddress('0xc671659c6dD68f1339e8aA9dbf633ec23589f16a'),
};

export function fundingContract(asset: AssetId): ContractAddress {
  const c = FUNDING_CONTRACT_ADDRESS[asset];
  if (!c) {
    throw new Error(
      `No FUNDING_CONTRACT_ADDRESS configured for asset: "${asset}"`
    );
  }
  return c;
}
