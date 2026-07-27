import { EvmWalletAddress } from '@coinlist-co/react/shared';

/**
 * Stand-in owner address for the SDK's balance reads (`useSwapTokenBalances`)
 * while no wallet is connected. The read is disabled in that state, so this
 * value never reaches an RPC — it only satisfies the hook's non-null address.
 */
export const ZERO_WALLET_ADDRESS = EvmWalletAddress(
  '0x0000000000000000000000000000000000000000'
);
