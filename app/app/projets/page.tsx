import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, ExternalLink } from "lucide-react";
import { PageHeader, StatCard, StatusBadge } from "@/components/app/page-header";
import { submissionStatusLabel } from "@/lib/admin/labels";
import { getSession } from "@/lib/auth/session";
import { listSubmissionsForUser } from "@/server/repositories/learning";

function statusTone(status: string): "brand" | "progress" | "action" | "danger" | "neutral" {
  const s = status.toLowerCase();
  if (["approved", "validated", "reviewed", "graded"].includes(s)) return "progress";
  if (["submitted", "pending", "in_review"].includes(s)) return "action";
  if (["rejected", "needs_changes"].includes(s)) return "danger";
  if (s === "draft") return "neutral";
  return "brand";
}

export default async function ProjetsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }

  const submissions = await listSubmissionsForUser(session.user.id);
  const reviewed = submissions.filter((s) =>
    ["approved", "validated", "reviewed", "graded"].includes(s.status.toLowerCase()),
  ).length;

  return (
    <section className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Exercices & projets"
        subtitle="Suivez vos soumissions et le retour des formateurs. Pour déposer un livrable, ouvrez la leçon concernée."
      />

      {submissions.length === 0 ? (
        <div className="ui-card border-dashed p-6 text-center sm:p-8">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <ClipboardList className="h-6 w-6" strokeWidth={2} aria-hidden />
          </span>
          <p className="font-display font-semibold text-ink">Aucune soumission pour le moment</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
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
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Soumissions" value={submissions.length} hint="au total" />
            <StatCard label="Corrigées" value={reviewed} tone="progress" hint="avec retour formateur" />
          </div>

          <ul className="space-y-3">
            {submissions.map((s) => {
              const lessonHref =
                s.courseSlug && s.lessonId
                  ? `/app/formations/${s.courseSlug}/lecons/${s.lessonId}`
                  : null;
              return (
                <li key={s.id} className="ui-card space-y-3 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="font-semibold text-ink">{s.assignmentTitle}</h2>
                    <StatusBadge label={submissionStatusLabel(s.status)} tone={statusTone(s.status)} />
                  </div>
                  <p className="text-xs text-ink-muted">
                    {s.submittedAt
                      ? `Soumis le ${new Date(s.submittedAt).toLocaleString("fr-FR")}`
                      : "Brouillon"}
                    {s.score != null ? ` · Note ${s.score}/100` : ""}
                  </p>
                  {s.reviewComment ? (
                    <div className="rounded-soft border-l-4 border-progress-400 bg-progress-50/50 p-3 text-sm text-ink">
                      <span className="font-semibold">Retour formateur : </span>
                      {s.reviewComment}
                    </div>
                  ) : null}
                  {lessonHref ? (
                    <Link
                      href={lessonHref}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" strokeWidth={2} aria-hidden />
                      Ouvrir la leçon
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
