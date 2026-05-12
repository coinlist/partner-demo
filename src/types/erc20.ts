import type { Newtype } from '@/types/newtype';

export type Erc20ContractAddress = Newtype<
  `0x${string}`,
  'Erc20ContractAddress'
>;
export const Erc20ContractAddress = (value: string) =>
  value as Erc20ContractAddress;

export type TxHash = Newtype<`0x${string}`, 'TxHash'>;
export const TxHash = (value: string) => value as TxHash;

export const USDC_CONTRACT_ADDRESS = Erc20ContractAddress(
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
);
export const USDT_CONTRACT_ADDRESS = Erc20ContractAddress(
  '0xdAC17F958D2ee523a2206206994597C13D831ec7'
);
