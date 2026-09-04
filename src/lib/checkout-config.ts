import { type CheckoutConfig, defaultCheckoutConfig } from '@coinlist-co/react';
import { AssetSymbol, type OrderBookSide } from '@coinlist-co/react/shared';

/**
 * Everything `CheckoutContainer` needs that an offer cannot tell it, for every
 * offer type CoinList can serve.
 *
 * A function of the trade direction rather than a module constant, because
 * `side` is the one entry that is neither per-offer nor per-integration: the
 * same Ondo offer is both buyable and sellable, so only the screen that opened
 * the checkout knows which way it runs. Everything else here varies per offer
 * at most, and does so as a function of the offer.
 *
 * The SDK reads `side` once, when the checkout mounts, so the returned
 * object's identity never matters to it. Callers still memoize on `side` so a
 * re-render does not hand the SDK a new object for no reason.
 *
 * `defaultCheckoutConfig` requires only the entries a host has to own, which
 * today is `ondo::swap` and `coinlist::token_sale`, and fills the rest from the
 * SDK's own defaults. A new offer type therefore renders the SDK default here
 * instead of breaking the build, so this file is worth a look whenever the SDK
 * adds one.
 */
export function checkoutConfig(side: OrderBookSide): CheckoutConfig {
  return defaultCheckoutConfig({
    'ondo::swap': {
      // Ondo's API symbol tracks the underlying ticker, which for this
      // catalogue is the asset code CoinList already returns. A partner whose
      // offers disagree - Ondo renames on a rebrand, and testnet offers may
      // stand in a mock asset - maps the exceptions here instead.
      symbol: (offer) => AssetSymbol(offer.asset.code),
      // Which way the trade runs. Required with no default: the wire parameter
      // behind it defaults to `buy` silently, so an unstated direction would
      // fill a sale as a purchase.
      side: () => side,
    },
    'coinlist::token_sale': {
      // Unreachable: the offer page routes token sales to /offer/[id]/invest
      // before a checkout is ever mounted. The key is still required, and
      // rendering nothing is the honest answer - throwing here would turn a
      // routing bug into a crash. Delete both this and that route once the SDK
      // ships the token-sale flow.
      render: () => null,
    },
  });
}
