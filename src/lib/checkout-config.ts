import type { CheckoutConfig } from '@passage-cl/react';

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
 * No provider needs anything here: the direction is `CheckoutContainer`'s
 * `side`, the token sale reads its funding contract and price off the offer,
 * and the order callbacks stay unset - each checkout's own dialog confirms
 * the order.
 */
export const CHECKOUT_CONFIG: CheckoutConfig = {};
