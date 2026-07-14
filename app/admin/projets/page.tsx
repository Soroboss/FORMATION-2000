import Link from "next/link";
import { reviewSubmissionAction } from "@/server/actions/admin-ops";
import { listSubmissions } from "@/server/repositories/admin-learning";
import { Button } from "@/components/ui/button";
import { AdminEmptyState, AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { submissionStatusLabel } from "@/lib/admin/labels";

export default async function AdminProjetsPage() {
  const submissions = await listSubmissions();

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Exercices & projets"
        description="Revue des livrables soumis par les apprenants."
      />

      {submissions.length === 0 ? (
        <AdminEmptyState
          title="Aucune soumission"
          description="Les exercices déposés depuis les leçons apparaîtront ici."
        />
      ) : (
        <ul className="space-y-4">
          {submissions.map((s) => (
            <li key={s.id} className="ui-card p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={s.status} label={submissionStatusLabel(s.status)} />
                <Link
                  href={`/admin/membres/${s.userId}`}
                  className="text-xs font-semibold text-brand-700 hover:underline"
                >
                  Voir le membre
                </Link>
                {s.submittedAt ? (
                  <span className="text-xs text-ink-muted">
                    {new Date(s.submittedAt).toLocaleString("fr-FR")}
                  </span>
                ) : null}
              </div>
              {s.content ? (
                <p className="mt-3 whitespace-pre-wrap text-sm text-ink">{s.content}</p>
              ) : null}
              {s.submissionUrl ? (
                <a
                  href={s.submissionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline"
                >
                  Lien livrable
                </a>
              ) : null}
              <form action={reviewSubmissionAction} className="mt-4 grid gap-2 sm:grid-cols-4">
                <input type="hidden" name="submissionId" value={s.id} />
                <select
                  name="status"
                  defaultValue="approved"
                  className="rounded-soft border border-canvas-border px-3 py-2 text-sm"
                >
                  <option value="approved">Approuvé</option>
                  <option value="rejected">Rejeté</option>
                  <option value="needs_changes">À corriger</option>
                </select>
                <input
                  name="score"
                  type="number"
                  placeholder="Score"
                  className="rounded-soft border border-canvas-border px-3 py-2 text-sm"
                />
                <input
                  name="reviewComment"
                  placeholder="Commentaire"
                  className="rounded-soft border border-canvas-border px-3 py-2 text-sm sm:col-span-2"
                />
                <Button type="submit" size="sm" className="sm:col-span-4 sm:w-fit">
                  Enregistrer la revue
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
