import Link from "next/link";
import { redirect } from "next/navigation";
import { submissionStatusLabel } from "@/lib/admin/labels";
import { getSession } from "@/lib/auth/session";
import { listSubmissionsForUser } from "@/server/repositories/learning";

export default async function ProjetsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }

  const submissions = await listSubmissionsForUser(session.user.id);

  return (
    <section className="space-y-6">
      <div className="ui-card p-5 sm:p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Exercices & projets</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Suivez vos soumissions et le retour des formateurs. Pour déposer un nouveau livrable,
          ouvrez la leçon concernée.
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="ui-card border-dashed p-6 text-center">
          <p className="font-display font-semibold text-ink">Aucune soumission pour le moment</p>
          <p className="mt-2 text-sm text-ink-muted">
            Ouvrez une formation, puis une leçon avec exercice pour déposer votre travail.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/app/catalogue"
              className="inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Catalogue
            </Link>
            <Link
              href="/app/mes-formations"
              className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              Mes formations
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {submissions.map((s) => {
            const lessonHref =
              s.courseSlug && s.lessonId
                ? `/app/formations/${s.courseSlug}/lecons/${s.lessonId}`
                : null;
            return (
              <li key={s.id} className="ui-card space-y-2 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-semibold text-ink">{s.assignmentTitle}</h2>
                  <span className="rounded-soft bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
                    {submissionStatusLabel(s.status)}
                  </span>
                </div>
                <p className="text-xs text-ink-muted">
                  {s.submittedAt
                    ? `Soumis le ${new Date(s.submittedAt).toLocaleString("fr-FR")}`
                    : "Brouillon"}
                  {s.score != null ? ` · Note ${s.score}/100` : ""}
                </p>
                {s.reviewComment ? (
                  <p className="rounded-soft bg-canvas p-3 text-sm text-ink">
                    <span className="font-semibold">Retour : </span>
                    {s.reviewComment}
                  </p>
                ) : null}
                {lessonHref ? (
                  <Link
                    href={lessonHref}
                    className="inline-block text-sm font-semibold text-brand-600 hover:underline"
                  >
                    Ouvrir la leçon
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
