import { Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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
          <a
            href={DOCS_HREF}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-zinc-700 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            View our docs
          </a>
          <Link
            href={ROUTES.SETTINGS}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <Settings size={16} />
            Settings
          </Link>
        </div>
      </div>
    </header>
  );
}
