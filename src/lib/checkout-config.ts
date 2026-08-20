import { type CheckoutConfig, defaultCheckoutConfig } from '@coinlist-co/react';
import { AssetSymbol } from '@coinlist-co/react/shared';

/**
 * Everything `CheckoutContainer` needs that an offer cannot tell it, for every
 * offer type CoinList can serve.
 *
 * A module constant rather than something a viewmodel builds, because nothing
 * in it depends on React state: the entries that vary per offer are functions
 * of the offer, so one object serves the whole catalogue. A host that wanted an
 * `onOrderConfirmed` closing over component state would have to memoize it
 * instead - the SDK keys effects off this object's identity.
 *
 * Every key of `CheckoutConfig` is required, so a new offer type shipped by
 * CoinList breaks this file at compile time rather than rendering a blank page.
 */
export const CHECKOUT_CONFIG: CheckoutConfig = defaultCheckoutConfig({
  'ondo::swap': {
    // Ondo's API symbol tracks the underlying ticker, which for this catalogue
    // is the asset code CoinList already returns. A partner whose offers
    // disagree - Ondo renames on a rebrand, and testnet offers may stand in a
    // mock asset - maps the exceptions here instead.
    symbol: (offer) => AssetSymbol(offer.asset.code),
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
