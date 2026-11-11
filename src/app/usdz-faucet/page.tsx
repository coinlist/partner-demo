import { notFound } from 'next/navigation';
import { UsdzFaucetContainer } from '@/features/usdz-faucet/UsdzFaucetContainer';
import { DEMO_CHAIN } from '@/lib/chain';

export default function UsdzFaucetPage() {
  // USDZ exists only on Sepolia, so a mainnet build has no faucet.
  if (DEMO_CHAIN !== 'ethereum_sepolia') notFound();
  return <UsdzFaucetContainer />;
}
