export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16" role="status" aria-live="polite">
      <p className="sr-only">Chargement…</p>
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="mt-6 space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
