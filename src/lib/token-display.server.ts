import 'server-only';

import type { CoinListServer } from '@coinlist-co/react/server';
import type {
  OfferToken,
  TokenLogo,
  TokenMetadata,
} from '@coinlist-co/react/universal';

/**
 * TEMPORARY: moves into the SDK, after which the SDK's cards and offer pages
 * resolve this themselves. Mirrors frontline-web's
 * `src/lib/coinlist/token-display.server.ts`.
 *
 * What a card or offer page displays for an offer's token, from the Nabu
 * token registry. Frontline's offer fields (`tagline`, `logo_url`) are
 * optional and blank on Ondo offers; the registry is the source of truth for
 * a token's name, ticker and logo.
 */
export type TokenDisplay = {
  name: string;
  code: string;
  logo: TokenLogo;
  /** Dark-theme logo; `null` when the registry configures none. */
  logoDark: TokenLogo | null;
};

/** Resolves an offer (or offer detail) to its registry display, if listed. */
export type TokenDisplays = (offer: {
  tokens: OfferToken[];
}) => TokenDisplay | null;

/**
 * Loads the complete registry snapshot once — every chain in one request —
 * and returns a resolver over it. A registry outage resolves every offer to
 * `null`, so pages fall back to the offer's own fields rather than failing.
 */
export async function loadTokenDisplays(
  coinlist: CoinListServer
): Promise<TokenDisplays> {
  const tokens = await coinlist.tokens.list().catch(() => []);
  const registry = new Map(
    tokens.map((token) => [
      registryKey(token.identifier.chain, token.identifier.address),
      token,
    ])
  );

  return (offer) => {
    // The token the offer is *about*: distributed by a sale, received in a
    // swap. Funding tokens are what the user pays with and never name it.
    for (const token of offer.tokens) {
      if (token.role === 'funding') continue;
      const metadata = registry.get(registryKey(token.chain, token.address));
      if (metadata) return toDisplay(metadata);
    }
    return null;
  };
}

// The registry serves EIP-55 checksummed addresses; offers may carry any
// casing.
function registryKey(chain: string, address: string): string {
  return `${chain}:${address.toLowerCase()}`;
}

function toDisplay(metadata: TokenMetadata): TokenDisplay {
  return {
    name: metadata.name,
    code: metadata.symbol,
    logo: metadata.logo,
    logoDark: metadata.logoDark,
  };
}
