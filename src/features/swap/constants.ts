import {
  type EthereumChain,
  type EvmContractAddress,
  type OfferId,
  SUPERSTATE_SWAP_CONTRACT_ADDRESS_SEPOLIA,
  TOKEN_REGISTRY,
  USDC_SYMBOL,
} from '@coinlist-co/react/shared';

/**
 * The SDK's `OfferDetail` does not yet carry an offer "type", so the demo
 * hard-codes which offers should open the Superstate swap flow instead of the
 * standard participation flow. Replace the placeholder with a real swap-enabled
 * offer id from your CoinList environment.
 *
 * TODO: The SDK must expose an `offerType` field on the offer/`OfferDetail`
 * and we should use it to determine the offer type, replacing this hard-coded
 * allowlist entirely (e.g. `offer.offerType === 'swap'`).
 */
export const SWAP_OFFER_IDS: readonly OfferId[] = [
  '019e8f25-9e23-7c59-9ab6-471086e62dfd' as OfferId,
];

export function isSwapOffer(offerId: OfferId): boolean {
  // The swap flow always runs on SWAP_CHAIN (Sepolia, the chain the SDK ships a
  // swap contract for), independently of the demo's DEMO_CHAIN. That's by
  // design: a swap-listed offer opens the swap flow regardless of the demo
  // chain, and the wallet prompts a network switch at the first signature.
  return SWAP_OFFER_IDS.includes(offerId);
}

/**
 * The swap flow targets the Superstate contract on Sepolia. The SDK ships the
 * Sepolia address; a mainnet deployment would supply its own.
 */
export const SWAP_CHAIN: EthereumChain = 'ethereum_sepolia';
export const SWAP_CONTRACT_ADDRESS: EvmContractAddress =
  SUPERSTATE_SWAP_CONTRACT_ADDRESS_SEPOLIA;

/** The demo accepts a single stablecoin to keep the flow simple. */
export const INPUT_SYMBOL = USDC_SYMBOL;
export const INPUT_ERC20 = TOKEN_REGISTRY.erc20(INPUT_SYMBOL);
export const INPUT_TOKEN_ADDRESS = TOKEN_REGISTRY.contractAddress(
  INPUT_SYMBOL,
  SWAP_CHAIN
);

export const ISSUER_NAME = 'Superstate';

/** BCP-47 locale used for all amount/price formatting in the flow. */
export const LOCALE = 'en-US';
