import type { EthereumChain } from '@coinlist-co/react/shared';
import { getChainId } from '@coinlist-co/react/shared';
import { base, baseSepolia, mainnet, sepolia } from '@reown/appkit/networks';
import type { Chain } from 'viem';

/**
 * The wagmi/viem chain object for each chain the SDK models. AppKit re-exports
 * `viem/chains` verbatim, so one map serves both AppKit and the wallet adapter.
 */
export const CHAINS = {
  ethereum_mainnet: mainnet,
  ethereum_sepolia: sepolia,
  base_mainnet: base,
  base_sepolia: baseSepolia,
} satisfies Record<EthereumChain, Chain>;

const ALLOWED_CHAINS = Object.keys(CHAINS) as EthereumChain[];

/**
 * Single source of truth for which chain the demo runs on.
 *
 * Selected via `NEXT_PUBLIC_CHAIN` so it's a *local* override: set
 * `NEXT_PUBLIC_CHAIN=ethereum_mainnet` for a build that serves mainnet offers.
 * Unset = `ethereum_sepolia`, matching the offers the demo ships with.
 */
function resolveDemoChain(): EthereumChain {
  const value = process.env.NEXT_PUBLIC_CHAIN;
  // Unset defaults to a testnet: the demo currently serves only Sepolia
  // offers, and FUNDING_CONTRACT_ADDRESS holds only Sepolia spenders, so a
  // mainnet default would turn a forgotten env var into a real approve on the
  // wrong chain. Serving a mainnet offer means keying that map by chain too.
  if (!value) return 'ethereum_sepolia';
  // Set-but-invalid is a config mistake worth failing loudly on, rather than
  // silently sending traffic for the wrong chain.
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
export const APPKIT_NETWORK = CHAINS[DEMO_CHAIN];

/** Numeric EVM chain id (1 mainnet, 11155111 sepolia) for {@link DEMO_CHAIN}. */
export const DEMO_CHAIN_ID = getChainId(DEMO_CHAIN);
