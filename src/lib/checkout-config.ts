import type { CheckoutConfig } from '@coinlist-co/react';

/**
 * Everything `CheckoutContainer` needs that an offer cannot tell it, for every
 * offer type CoinList can serve.
 *
 * Today that is nothing: the SDK fills every entry from its own defaults (the
 * swap providers look their contracts and symbols up themselves, and the
 * `side` a swap runs is a per-render prop that defaults to `'buy'`, which is
 * the only direction this demo offers). Token sales never reach the checkout -
 * the offer page routes them to the demo's own flow at `/offer/[id]/invest`
 * before a checkout is ever mounted.
 *
 * The object stays, and stays a module constant rather than a value a
 * viewmodel builds, because nothing in it depends on React state: the entries
 * that vary per offer are functions of the offer, so one object serves the
 * whole catalogue. A host that wants an `onOrderConfirmed` closing over
 * component state would have to memoize it instead - the SDK keys effects off
 * this object's identity.
 */
export const CHECKOUT_CONFIG: CheckoutConfig = {};
