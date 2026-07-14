import { reviewSubmissionAction } from "@/server/actions/admin-ops";
import { listSubmissions } from "@/server/repositories/admin-learning";
import { Button } from "@/components/ui/button";

export default async function AdminProjetsPage() {
  const submissions = await listSubmissions();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Exercices & projets</h1>
        <p className="mt-1 text-sm text-slate-600">Revue des soumissions.</p>
      </div>
      <ul className="space-y-4">
        {submissions.map((s) => (
          <li key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">
              {s.status} · {s.userId.slice(0, 8)}…
              {s.submittedAt ? ` · ${new Date(s.submittedAt).toLocaleString("fr-FR")}` : ""}
            </p>
            {s.content ? (
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{s.content}</p>
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
              <select name="status" defaultValue="approved" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="approved">Approuvé</option>
                <option value="rejected">Rejeté</option>
                <option value="needs_changes">À corriger</option>
              </select>
              <input name="score" type="number" placeholder="Score" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input name="reviewComment" placeholder="Commentaire" className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
              <Button type="submit" size="sm" className="sm:col-span-4 sm:w-fit">
                Enregistrer la revue
              </Button>
            </form>
          </li>
        ))}
      </ul>
      {submissions.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          Aucune soumission.
        </p>
      ) : null}
    </section>
  );
}
