import { InlineErrorText } from "@/components/InlineErrorText";
import { OffersGrid } from "@coinlist-co/react/client/components";

export function HomeView({
  loggingOut,
  logoutError,
  onLogout,
}: {
  loggingOut: boolean;
  logoutError: string | null;
  onLogout: () => Promise<void>;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-base text-zinc-800 dark:text-zinc-200">
        You are logged in. 🎉
      </p>
      <button
        type="button"
        onClick={() => onLogout()}
        disabled={loggingOut}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        {loggingOut ? "Signing out…" : "Sign out"}
      </button>
      <InlineErrorText message={logoutError} />
      <OffersGrid />
    </div>
  );
}
