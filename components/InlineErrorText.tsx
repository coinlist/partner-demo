export function InlineErrorText({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="text-center text-sm text-red-600 dark:text-red-400"
    >
      {message}
    </p>
  );
}
