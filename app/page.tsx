import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl items-center justify-center px-6 py-24">
        <Link
          href="/sign-in"
          className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Sign in
        </Link>
      </main>
    </div>
  );
}
