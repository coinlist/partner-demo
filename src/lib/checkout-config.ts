import type { CheckoutConfig } from '@coinlist-co/react';

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
 * Every entry is optional, and an offer type with none gets the SDK's defaults.
 * Ondo and Centrifuge need nothing here: the demo only invests, which is
 * `CheckoutContainer`'s default `side`, and leaves the order callbacks unset.
 */
export const CHECKOUT_CONFIG: CheckoutConfig = {
  'coinlist::token_sale': {
    // Unreachable: the offer page routes token sales to /offer/[id]/invest
    // before a checkout is ever mounted. Rendering nothing is the honest
    // answer - throwing here would turn a routing bug into a crash. Delete
    // both this and that route once the SDK ships the token-sale flow.
    render: () => null,
  },
};
