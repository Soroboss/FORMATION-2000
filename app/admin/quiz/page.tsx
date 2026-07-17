import Link from "next/link";
import { listQuizzesAdmin } from "@/server/repositories/admin-quiz";
import { listCourses } from "@/server/repositories/catalog";
import { createQuizAction } from "@/server/actions/admin-quiz";
import { AdminEmptyState, AdminPageHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-brand border border-canvas-border bg-canvas-card px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  draft: { label: "Brouillon", tone: "bg-canvas text-ink-muted" },
  published: { label: "Publié", tone: "bg-progress-50 text-progress-700" },
  archived: { label: "Archivé", tone: "bg-action-50 text-action-700" },
};

export default async function AdminQuizPage() {
  const [quizzes, courses] = await Promise.all([listQuizzesAdmin(), listCourses()]);

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Quiz"
        description="Créez et éditez les quiz d'évaluation rattachés aux formations."
      />

      <form action={createQuizAction} className="ui-card space-y-4 p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-ink">Nouveau quiz</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-ink-muted">
              Titre
            </label>
            <input id="title" name="title" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="courseId" className="mb-1 block text-sm font-medium text-ink-muted">
              Formation (facultatif)
            </label>
            <select id="courseId" name="courseId" className={inputClass} defaultValue="">
              <option value="">Aucune</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="passingScore" className="mb-1 block text-sm font-medium text-ink-muted">
              Score de réussite (%)
            </label>
            <input
              id="passingScore"
              name="passingScore"
              type="number"
              min={0}
              max={100}
              defaultValue={70}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-ink-muted">
              Description
            </label>
            <textarea id="description" name="description" rows={2} className={inputClass} />
          </div>
        </div>
        <Button type="submit">Créer le quiz</Button>
      </form>

      {quizzes.length === 0 ? (
        <AdminEmptyState title="Aucun quiz" description="Créez votre premier quiz ci-dessus." />
      ) : (
        <div className="ui-card overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-canvas-border bg-canvas/60 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Questions</th>
                <th className="px-4 py-3">Réussite</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Éditer</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => {
                const meta = STATUS_LABEL[quiz.status] ?? STATUS_LABEL.draft;
                return (
                  <tr key={quiz.id} className="border-b border-canvas-border last:border-0">
                    <td className="px-4 py-3 font-semibold text-ink">{quiz.title}</td>
                    <td className="px-4 py-3 text-ink-muted">{quiz.questionCount}</td>
                    <td className="px-4 py-3 text-ink-muted">{quiz.passingScore}%</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-soft px-2 py-1 text-xs font-semibold ${meta?.tone}`}>
                        {meta?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/quiz/${quiz.id}`}
                        className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                      >
                        Éditer
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
