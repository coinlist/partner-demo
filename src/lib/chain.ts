import type { EthereumChain } from '@coinlist-co/react/shared';
import { getChainId } from '@coinlist-co/react/shared';
import { mainnet, sepolia } from '@reown/appkit/networks';

/**
 * Single source of truth for which chain the demo runs on.
 *
 * Selected via `NEXT_PUBLIC_CHAIN` so it's a *local* override: set
 * `NEXT_PUBLIC_CHAIN=ethereum_sepolia` in `.env.local` when testing against a
 * backend that only accepts testnet chains. Unset = `ethereum_mainnet`, the
 * production default.
 */
const APPKIT_NETWORKS = {
  ethereum_mainnet: mainnet,
  ethereum_sepolia: sepolia,
} satisfies Record<EthereumChain, unknown>;

const ALLOWED_CHAINS = Object.keys(APPKIT_NETWORKS) as EthereumChain[];

function resolveDemoChain(): EthereumChain {
  const value = process.env.NEXT_PUBLIC_CHAIN;
  // Unset = intentional production default.
  if (!value) return 'ethereum_mainnet';
  // Set-but-invalid is a config mistake worth failing loudly on, rather than
  // silently sending traffic for the wrong chain (e.g. a mainnet fallback that
  // then 500s against a testnet-only backend — the very bug this override fixes).
  if ((ALLOWED_CHAINS as string[]).includes(value)) {
    return value as EthereumChain;
  }
  throw new Error(
    `Invalid NEXT_PUBLIC_CHAIN "${value}". Expected one of: ${ALLOWED_CHAINS.join(
      ', '
    )}.`
  );
}

/** The chain the demo talks to the backend as (e.g. wallet-ownership challenge). */
export const DEMO_CHAIN: EthereumChain = resolveDemoChain();

/** The Reown AppKit / wagmi network object for {@link DEMO_CHAIN}. */
export const APPKIT_NETWORK = APPKIT_NETWORKS[DEMO_CHAIN];

/** Numeric EVM chain id (1 mainnet, 11155111 sepolia) for {@link DEMO_CHAIN}. */
export const DEMO_CHAIN_ID = getChainId(DEMO_CHAIN);

/** Human-readable network name ("Ethereum", "Sepolia") for UI copy. */
export const DEMO_CHAIN_NAME = APPKIT_NETWORK.name;
