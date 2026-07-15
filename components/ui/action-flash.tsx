export function ActionFlash({
  ok,
  error,
}: {
  ok?: string;
  error?: string;
}) {
  if (!ok && !error) return null;
  return (
    <>
      {error ? (
        <div
          role="alert"
          className="rounded-soft border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}
      {ok ? (
        <div
          role="status"
          className="rounded-soft border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          {ok}
        </div>
      ) : null}
    </>
  );
}
