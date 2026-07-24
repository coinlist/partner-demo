import { AssetCode, OfferId } from '@coinlist-co/react/shared';
import {
  ContractAddress,
  type Erc20ContractAddress,
  USDC_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
} from '@/types/erc20';

export const USDC = AssetCode('USDC');
export const USDT = AssetCode('USDT');

const SEPOLIA_SWAP_OFFER = OfferId('019f8b35-cdfa-7279-8527-4575870843df');
const SEPOLIA_TOKEN_SALE_OFFER = OfferId(
  '019f863c-11b1-7b21-a367-0ec66d25d4ba'
);

/**
 * ERC-20 contract addresses for the demo's active chain, keyed by CoinList
 * asset code.
 *
 * The code is the `code` field on each entry in OfferDetail.fundingAssets.
 * Keyed by code and not `id`, because ids are CoinList database identifiers:
 * USDC's changed from the legacy "usd-coin" slug to a UUID when the backend
 * moved asset references onto Postgres record ids, breaking every lookup here.
 * A code is unique and immutable once its asset exists, enforced backend-side
 * in `Frontline.Assets.Asset`, so it survives that class of migration. Casing
 * is convention rather than constraint, so these keys assume upper case.
 *
 * Add entries here for any additional funding assets your offer supports.
 */
const ASSET_CONTRACT_ADDRESS: Record<AssetCode, Erc20ContractAddress> = {
  [USDC]: USDC_CONTRACT_ADDRESS,
  [USDT]: USDT_CONTRACT_ADDRESS,
};

export function assetContract(code: AssetCode): Erc20ContractAddress {
  const c = ASSET_CONTRACT_ADDRESS[code];
  if (!c) {
    throw new Error(
      `No ASSET_CONTRACT_ADDRESS configured for asset: "${code}"`
    );
  }
  return c;
}

// Spender contract each offer's participation approve targets, keyed by offer:
// two offers selling the same token can fund through different contracts.
// Chain-specific and not part of the offer response, so add an entry per
// supported offer with an address on the build's `DEMO_CHAIN`.
//
// Every entry below is a Sepolia address, because the demo currently serves
// testnet offers only. To serve a mainnet offer, nest this by chain and index
// it with `DEMO_CHAIN`, matching how the backend already models it as
// `{offer_id, chain, contract}`:
//
//   Record<EthereumChain, Record<OfferId, ContractAddress>>
//
// The asset side needs no change either way: TOKEN_REGISTRY already resolves
// USDC and USDT per chain.
const FUNDING_CONTRACT_ADDRESS: Record<OfferId, ContractAddress> = {
  [SEPOLIA_SWAP_OFFER]: ContractAddress(
    '0x27E8CE9Ca1A1E98Bc4009F08Dc596bFcf88aCED1'
  ),
  [SEPOLIA_TOKEN_SALE_OFFER]: ContractAddress(
    '0xAdE1da4D09479cc51D53884A3B5Ae15656f34FcC'
  ),
};

export function fundingContract(offerId: OfferId): ContractAddress {
  const c = FUNDING_CONTRACT_ADDRESS[offerId];
  if (!c) {
    throw new Error(
      `No FUNDING_CONTRACT_ADDRESS configured for offer: "${offerId}"`
    );
  }
  return c;
}
