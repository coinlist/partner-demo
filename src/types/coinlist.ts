import {
  type Asset,
  type StablecoinSymbol,
  USDC_SYMBOL,
  USDT_SYMBOL,
} from '@coinlist-co/react/universal';

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
