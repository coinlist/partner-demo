export declare const __brand: unique symbol;
export type Newtype<Base, Branding> = Base & { readonly [__brand]: Branding };
