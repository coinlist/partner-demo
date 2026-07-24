import {
  type EthereumChain,
  type EvmContractAddress,
  SUPERSTATE_SWAP_CONTRACT_ADDRESS_SEPOLIA,
  TOKEN_REGISTRY,
  USDC_SYMBOL,
} from '@coinlist-co/react/shared';

/**
 * The swap flow targets the Superstate contract on Sepolia. The SDK ships the
 * Sepolia address; a mainnet deployment would supply its own.
 */
export const SWAP_CHAIN: EthereumChain = 'ethereum_sepolia';
export const SWAP_CONTRACT_ADDRESS: EvmContractAddress =
  SUPERSTATE_SWAP_CONTRACT_ADDRESS_SEPOLIA;

/** The demo accepts a single stablecoin to keep the flow simple. */
export const INPUT_SYMBOL = USDC_SYMBOL;
export const INPUT_ERC20 = TOKEN_REGISTRY.erc20(INPUT_SYMBOL);
export const INPUT_TOKEN_ADDRESS = TOKEN_REGISTRY.contractAddress(
  INPUT_SYMBOL,
  SWAP_CHAIN
);

export const ISSUER_NAME = 'Superstate';

/** BCP-47 locale used for all amount/price formatting in the flow. */
export const LOCALE = 'en-US';
