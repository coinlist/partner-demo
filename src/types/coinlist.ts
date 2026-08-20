import {
  type Asset,
  type EthereumChain,
  EvmContractAddress,
  OfferId,
  type StablecoinSymbol,
  TOKEN_REGISTRY,
  USDC_SYMBOL,
  USDT_SYMBOL,
} from '@coinlist-co/react/shared';

const SEPOLIA_TOKEN_SALE_OFFER = OfferId(
  '019f863c-11b1-7b21-a367-0ec66d25d4ba'
);

/**
 * Funding stablecoins the demo can pay with, keyed by the asset's on-chain
 * ticker (`Asset.code`) rather than CoinList's opaque asset UUID. Keying by
 * ticker means every offer paying in USDC/USDT works with no per-offer edits —
 * the offer's own funding-asset id is irrelevant.
 *
 * Add an entry to support another stablecoin the SDK's token registry knows.
 */
const PAYMENT_SYMBOL_BY_CODE: Record<string, StablecoinSymbol> = {
  USDC: USDC_SYMBOL,
  USDT: USDT_SYMBOL,
};

/** The SDK stablecoin symbol for a funding asset, derived from its ticker. */
export function paymentSymbol(asset: Asset): StablecoinSymbol {
  const symbol = PAYMENT_SYMBOL_BY_CODE[asset.code.toString()];
  if (!symbol) {
    throw new Error(
      `Unsupported funding asset "${asset.code}" (${asset.id}). Supported: ${Object.keys(
        PAYMENT_SYMBOL_BY_CODE
      ).join(', ')}.`
    );
  }
  return symbol;
}

/**
 * ERC-20 contract for a funding asset on the given chain, from the SDK's token
 * registry — so a Sepolia build approves the Sepolia USDC/USDT rather than the
 * mainnet addresses. Decimals aren't needed here: read them straight off
 * `Asset.fractionalDigits`.
 */
export function paymentTokenAddress(
  asset: Asset,
  chain: EthereumChain
): EvmContractAddress {
  return TOKEN_REGISTRY.contractAddress(paymentSymbol(asset), chain);
}

// Spender contract each token sale's participation approve targets, keyed by
// offer: two offers selling the same token can fund through different
// contracts. Chain-specific and not part of the offer response, so add an entry
// per supported token sale with an address on the build's `DEMO_CHAIN`.
//
// Token sales only. Swap offers are the SDK's `CheckoutContainer` to handle,
// and it looks each provider's spender up itself, so an entry here for one
// would never be read.
//
// Every entry below is a Sepolia address, because the demo currently serves
// testnet offers only. To serve a mainnet offer, nest this by chain and index
// it with `DEMO_CHAIN`, matching how the backend already models it as
// `{offer_id, chain, contract}`:
//
//   Record<EthereumChain, Record<OfferId, EvmContractAddress>>
//
// The asset side needs no change either way: TOKEN_REGISTRY already resolves
// USDC and USDT per chain.
const FUNDING_CONTRACT_ADDRESS: Record<OfferId, EvmContractAddress> = {
  [SEPOLIA_TOKEN_SALE_OFFER]: EvmContractAddress(
    '0xAdE1da4D09479cc51D53884A3B5Ae15656f34FcC'
  ),
};

/** The `approve()` spender contract for a sale, keyed by offer id. */
export function fundingContract(offerId: OfferId): EvmContractAddress {
  const c = FUNDING_CONTRACT_ADDRESS[offerId];
  if (!c) {
    throw new Error(
      `No FUNDING_CONTRACT_ADDRESS configured for offer: "${offerId}"`
    );
  }
  return c;
}
