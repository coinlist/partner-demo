"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export interface BackButtonProps {
  label?: string;
}

export function BackButton({ label = "Back" }: BackButtonProps) {
  const router = useRouter();

  const onBackClick = () => {
    router.back();
  };

  return (
    <button
      type="button"
      onClick={onBackClick}
      className="inline-flex w-fit items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      aria-label={label}
    >
      <ArrowLeft size={16} />
      <span>{label}</span>
    </button>
  );
}
