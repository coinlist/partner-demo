import { LinkIcon } from 'lucide-react';
import type { OfferUiLink } from '@/features/offer/useOfferViewModel';

interface Props {
  link: OfferUiLink;
}

export function OfferLink({ link }: Props) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
    >
      <LinkIcon size={12} aria-hidden />
      <span>{link.label}</span>
    </a>
  );
}
