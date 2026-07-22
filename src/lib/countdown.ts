/**
 * Formats the time left until `endsAt` as a coarse `"2D 5H 13M"` countdown, or
 * `"Ended"` once it has passed. Computed on each render rather than ticking, so
 * it refreshes whenever its host re-renders. Shared by the invest and swap
 * flows so both show the sale window the same way.
 */
export function formatCountdown(endsAt: Date): string {
  const diff = endsAt.getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days}D ${hours}H ${minutes}M`;
}
