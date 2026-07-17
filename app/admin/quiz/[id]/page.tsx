import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuizAdmin } from "@/server/repositories/admin-quiz";
import {
  deleteQuestionAction,
  deleteQuizAction,
  setQuizStatusAction,
  updateQuizMetaAction,
} from "@/server/actions/admin-quiz";
import { AdminPageHeader } from "@/components/admin/ui";
import { QuizQuestionForm } from "@/components/admin/quiz-question-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-brand border border-canvas-border bg-canvas-card px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

const TYPE_LABEL: Record<string, string> = {
  single: "Choix unique",
  multiple: "Choix multiple",
  true_false: "Vrai / Faux",
  short: "Réponse courte",
};

export default async function AdminQuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quiz = await getQuizAdmin(id);
  if (!quiz) notFound();

  return (
    <section className="space-y-6">
      <div>
        <Link href="/admin/quiz" className="text-sm font-semibold text-brand-600 hover:underline">
          ← Tous les quiz
        </Link>
      </div>

      <AdminPageHeader
        title={quiz.title}
        description={`${quiz.questions.length} question(s) · réussite ${quiz.passingScore}% · ${quiz.status}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {quiz.status !== "published" ? (
              <form action={setQuizStatusAction}>
                <input type="hidden" name="id" value={quiz.id} />
                <input type="hidden" name="status" value="published" />
                <Button type="submit" size="sm">Publier</Button>
              </form>
            ) : (
              <form action={setQuizStatusAction}>
                <input type="hidden" name="id" value={quiz.id} />
                <input type="hidden" name="status" value="draft" />
                <Button type="submit" size="sm" variant="outline">Repasser en brouillon</Button>
              </form>
            )}
            <form action={setQuizStatusAction}>
              <input type="hidden" name="id" value={quiz.id} />
              <input type="hidden" name="status" value="archived" />
              <Button type="submit" size="sm" variant="ghost">Archiver</Button>
            </form>
          </div>
        }
      />

      <form action={updateQuizMetaAction} className="ui-card space-y-4 p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-ink">Paramètres</h2>
        <input type="hidden" name="id" value={quiz.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-ink-muted">Titre</label>
            <input id="title" name="title" defaultValue={quiz.title} className={inputClass} />
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
              defaultValue={quiz.passingScore}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-ink-muted">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={quiz.description ?? ""}
              className={inputClass}
            />
          </div>
        </div>
        <Button type="submit" variant="secondary">Enregistrer</Button>
      </form>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">Questions</h2>
        {quiz.questions.length === 0 ? (
          <p className="ui-card p-5 text-sm text-ink-muted">Aucune question pour l&apos;instant.</p>
        ) : (
          <ol className="space-y-3">
            {quiz.questions.map((q, index) => (
              <li key={q.id} className="ui-card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      {index + 1}. {TYPE_LABEL[q.questionType] ?? q.questionType} · {q.points} pt
                    </p>
                    <p className="mt-1 font-medium text-ink">{q.question}</p>
                  </div>
                  <form action={deleteQuestionAction}>
                    <input type="hidden" name="questionId" value={q.id} />
                    <input type="hidden" name="quizId" value={quiz.id} />
                    <button type="submit" className="text-sm font-semibold text-red-700 hover:text-red-800">
                      Supprimer
                    </button>
                  </form>
                </div>
                {q.options.length > 0 ? (
                  <ul className="mt-3 space-y-1 text-sm">
                    {q.options.map((opt) => (
                      <li
                        key={opt.id}
                        className={`flex items-center gap-2 ${opt.isCorrect ? "font-semibold text-progress-700" : "text-ink-muted"}`}
                      >
                        <span
                          className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                            opt.isCorrect ? "bg-progress-500 text-white" : "bg-canvas text-ink-muted"
                          }`}
                          aria-hidden
                        >
                          {opt.isCorrect ? "✓" : ""}
                        </span>
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {q.explanation ? (
                  <p className="mt-2 text-xs text-ink-muted">Explication : {q.explanation}</p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>

      <QuizQuestionForm quizId={quiz.id} />

      <form
        action={deleteQuizAction}
        className="ui-card flex items-center justify-between gap-3 border-red-200 p-4 sm:p-5"
      >
        <div>
          <p className="font-semibold text-ink">Supprimer ce quiz</p>
          <p className="text-sm text-ink-muted">Cette action est définitive.</p>
        </div>
        <input type="hidden" name="id" value={quiz.id} />
        <button type="submit" className="text-sm font-semibold text-red-700 hover:text-red-800">
          Supprimer
        </button>
      </form>
    </section>
  );
}
