import { CoinListSignInCard } from "coinlist-react/client/components";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-md">
        <CoinListSignInCard />
      </main>
    </div>
  );
}

