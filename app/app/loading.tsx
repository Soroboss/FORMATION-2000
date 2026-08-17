/**
 * Squelette affiché dès le clic dans l’espace membre (l’en-tête et le menu
 * restent en place) : sans lui, une page lente donne l’impression que le
 * bouton ne réagit pas.
 */
export default function LearnerAppLoading() {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <p className="sr-only">Chargement…</p>
      <div className="ui-card p-5">
        <div className="h-6 w-52 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="ui-card overflow-hidden">
            <div className="h-32 animate-pulse bg-slate-200" />
            <div className="space-y-3 p-4">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
