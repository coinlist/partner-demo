import {
  TOKEN_REGISTRY,
  USDC_SYMBOL,
  USDT_SYMBOL,
} from '@coinlist-co/react/shared';
import { DEMO_CHAIN } from '@/lib/chain';
import type { Newtype } from '@/types/newtype';

export type ContractAddress = Newtype<`0x${string}`, 'ContractAddress'>;
export const ContractAddress = (value: string) => value as ContractAddress;

export type Erc20ContractAddress = Newtype<
  `0x${string}`,
  'Erc20ContractAddress'
>;
export const Erc20ContractAddress = (value: string) =>
  value as Erc20ContractAddress;

export type TxHash = Newtype<`0x${string}`, 'TxHash'>;
export const TxHash = (value: string) => value as TxHash;

// Resolved from the SDK's token registry for the demo's active chain
// ({@link DEMO_CHAIN}), so a sepolia build approves the sepolia USDC/USDT
// rather than the hardcoded mainnet addresses.
export const USDC_CONTRACT_ADDRESS = Erc20ContractAddress(
  TOKEN_REGISTRY.contractAddress(USDC_SYMBOL, DEMO_CHAIN)
);
export const USDT_CONTRACT_ADDRESS = Erc20ContractAddress(
  TOKEN_REGISTRY.contractAddress(USDT_SYMBOL, DEMO_CHAIN)
);
