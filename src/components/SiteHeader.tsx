import Image from 'next/image';
import Link from 'next/link';
import { HeaderAccount } from '@/features/header/HeaderAccount';
import { DEMO_CHAIN } from '@/lib/chain';
import { ROUTES } from '@/lib/routes';

const DOCS_HREF = 'https://docs.passage.coinlist.co';

export function SiteHeader() {
  return (
    <header className="bg-white px-6 dark:bg-black">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between">
        <Link href={ROUTES.ROOT} className="flex items-center gap-2.5">
          <Image
            src="/brand/passage-logo.png"
            alt="Passage"
            width={700}
            height={125}
            className="h-6 w-auto dark:hidden"
          />
          <Image
            src="/brand/passage-logo-dark.png"
            alt=""
            width={700}
            height={125}
            className="hidden h-6 w-auto dark:block"
          />
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            Demo
          </span>
        </Link>
        <div className="flex items-center gap-5">
          {DEMO_CHAIN === 'ethereum_sepolia' && (
            // A new tab, so a visitor mid-checkout keeps their place.
            <a
              href={ROUTES.USDZ_FAUCET}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-zinc-700 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              Get USDZ
            </a>
          )}
          <a
            href={DOCS_HREF}
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm font-medium text-zinc-700 transition hover:text-zinc-900 sm:inline dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            View our docs
          </a>
          <HeaderAccount />
        </div>
      </div>
    </header>
  );
}
