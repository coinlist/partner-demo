import { type CheckoutConfig, defaultCheckoutConfig } from '@coinlist-co/react';

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
 * `defaultCheckoutConfig` requires only the entries a host has to own, which
 * today is `ondo::swap`, `coinlist::token_sale` and `centrifuge::vault`, and
 * fills the rest from the SDK's own defaults. A new offer type therefore
 * renders the SDK default here instead of breaking the build, so this file is
 * worth a look whenever the SDK adds one.
 */
export const CHECKOUT_CONFIG: CheckoutConfig = defaultCheckoutConfig({
  'ondo::swap': {
    // One Ondo route, and it invests. A host with a sell page passes whatever
    // selects the direction. The SDK derives Ondo's symbol from the offer.
    side: 'buy',
  },
  'coinlist::token_sale': {
    // Unreachable: the offer page routes token sales to /offer/[id]/invest
    // before a checkout is ever mounted. The key is still required, and
    // rendering nothing is the honest answer - throwing here would turn a
    // routing bug into a crash. Delete both this and that route once the SDK
    // ships the token-sale flow.
    render: () => null,
  },
  'centrifuge::vault': {
    // One vault route, and it deposits. The order callback is left unset.
    side: 'buy',
  },
});
