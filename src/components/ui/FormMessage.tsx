export function FormMessage({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;
  return (
    <div
      role={error ? "alert" : "status"}
      aria-live="polite"
      aria-atomic="true"
      className={
        error
          ? "rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
          : "rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success"
      }
    >
      {error ?? success}
    </div>
  );
}
