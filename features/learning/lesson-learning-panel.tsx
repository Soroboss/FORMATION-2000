"use client";

import { useState, useTransition } from "react";
import {
  completeLessonAction,
  saveNoteAction,
  startLessonAction,
  submitAssignmentAction,
  submitQuizAction,
  toggleFavoriteAction,
  type LearningActionResult,
} from "@/server/actions/learning";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import type { AssignmentSubmission, AssignmentSummary, QuizPublic } from "@/types/learning";

export function LessonLearningPanel({
  courseSlug,
  courseId,
  lessonId,
  initialNote,
  isLessonFavorite,
  isCourseFavorite,
  progressStatus,
  assignment,
  submission,
  quiz,
}: {
  courseSlug: string;
  courseId: string;
  lessonId: string;
  initialNote: string;
  isLessonFavorite: boolean;
  isCourseFavorite: boolean;
  progressStatus: string;
  assignment: AssignmentSummary | null;
  submission: AssignmentSubmission | null;
  quiz: QuizPublic | null;
}) {
  const [message, setMessage] = useState<LearningActionResult | null>(null);
  const [note, setNote] = useState(initialNote);
  const [lessonFav, setLessonFav] = useState(isLessonFavorite);
  const [courseFav, setCourseFav] = useState(isCourseFavorite);
  const [status, setStatus] = useState(progressStatus);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | string[]>>({});
  const [quizResult, setQuizResult] = useState<{
    score: number;
    passed: boolean;
    passingScore: number;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function run(
    kind: "start" | "complete" | "note" | "favorite" | "assignment" | "quiz",
    action: (formData: FormData) => Promise<LearningActionResult>,
    formData: FormData,
  ) {
    startTransition(async () => {
      const res = await action(formData);
      setMessage(res);
      if (!res.success) return;
      if (kind === "complete") setStatus("completed");
      if (kind === "start" && status === "not_started") setStatus("in_progress");
      if (kind === "favorite") {
        const entityType = String(formData.get("entityType"));
        const data = res.data as { favorited?: boolean } | undefined;
        if (entityType === "lesson") setLessonFav(Boolean(data?.favorited));
        if (entityType === "course") setCourseFav(Boolean(data?.favorited));
      }
      if (kind === "quiz") {
        setQuizResult(res.data as { score: number; passed: boolean; passingScore: number });
      }
    });
  }

  return (
    <div className="space-y-6">
      {message ? (
        <Alert variant={message.success ? "success" : "error"}>
          {message.success ? "Enregistré." : message.error}
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {status === "not_started" ? (
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => {
              const fd = new FormData();
              fd.set("courseSlug", courseSlug);
              fd.set("lessonId", lessonId);
              run("start", startLessonAction, fd);
            }}
          >
            Démarrer la leçon
          </Button>
        ) : null}
        <Button
          type="button"
          disabled={pending || status === "completed"}
          onClick={() => {
            const fd = new FormData();
            fd.set("courseSlug", courseSlug);
            fd.set("lessonId", lessonId);
            run("complete", completeLessonAction, fd);
          }}
        >
          {status === "completed" ? "Leçon terminée" : "Marquer comme terminée"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => {
            const fd = new FormData();
            fd.set("entityType", "lesson");
            fd.set("entityId", lessonId);
            run("favorite", toggleFavoriteAction, fd);
          }}
        >
          {lessonFav ? "Retirer des favoris" : "Favori leçon"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            const fd = new FormData();
            fd.set("entityType", "course");
            fd.set("entityId", courseId);
            run("favorite", toggleFavoriteAction, fd);
          }}
        >
          {courseFav ? "Formation en favoris" : "Favori formation"}
        </Button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-slate-900">Notes personnelles</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
          className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm"
          placeholder="Vos notes privées pour cette leçon…"
        />
        <Button
          type="button"
          className="mt-3"
          variant="secondary"
          disabled={pending}
          onClick={() => {
            const fd = new FormData();
            fd.set("courseSlug", courseSlug);
            fd.set("lessonId", lessonId);
            fd.set("content", note);
            run("note", saveNoteAction, fd);
          }}
        >
          Enregistrer la note
        </Button>
      </section>

      {assignment ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
          <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{assignment.instructions}</p>
          {assignment.expectedDeliverables.length > 0 ? (
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
              {assignment.expectedDeliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {submission ? (
            <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3 text-sm">
              <p className="text-xs font-medium text-progress-700">
                Statut :{" "}
                {submission.status === "approved"
                  ? "Validé"
                  : submission.status === "rejected"
                    ? "Refusé"
                    : submission.status === "needs_changes"
                      ? "À corriger"
                      : submission.status === "submitted"
                        ? "Soumis — en attente de revue"
                        : submission.status}
                {submission.submittedAt
                  ? ` · ${new Date(submission.submittedAt).toLocaleString("fr-FR")}`
                  : ""}
              </p>
              {submission.score != null ? (
                <p className="font-semibold text-slate-900">Note : {submission.score}/100</p>
              ) : null}
              {submission.reviewComment ? (
                <p className="whitespace-pre-wrap text-slate-700">
                  <span className="font-semibold">Commentaire : </span>
                  {submission.reviewComment}
                </p>
              ) : null}
            </div>
          ) : null}
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              fd.set("courseSlug", courseSlug);
              fd.set("lessonId", lessonId);
              run("assignment", submitAssignmentAction, fd);
            }}
          >
            <textarea
              name="content"
              rows={4}
              defaultValue={submission?.content ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Collez votre réponse / code…"
            />
            <input
              name="submissionUrl"
              type="url"
              defaultValue={submission?.submissionUrl ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Lien optionnel (Drive, GitHub…)"
            />
            <Button type="submit" disabled={pending}>
              Soumettre l&apos;exercice
            </Button>
          </form>
        </section>
      ) : null}

      {quiz ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900">{quiz.title}</h3>
          {quiz.description ? (
            <p className="mt-1 text-sm text-slate-600">{quiz.description}</p>
          ) : null}
          <p className="mt-2 text-xs text-slate-500">
            Score minimal : {quiz.passingScore}%
            {quiz.maxAttempts ? ` · max ${quiz.maxAttempts} tentatives` : ""}
          </p>

          {quizResult ? (
            <Alert variant={quizResult.passed ? "success" : "error"} className="mt-4">
              Score : {quizResult.score}% —{" "}
              {quizResult.passed ? "Réussi" : `Échoué (min. ${quizResult.passingScore}%)`}
            </Alert>
          ) : null}

          <div className="mt-4 space-y-4">
            {quiz.questions.map((question, index) => (
              <fieldset key={question.id} className="rounded-xl border border-slate-200 p-3">
                <legend className="px-1 text-sm font-medium text-slate-900">
                  {index + 1}. {question.question}
                </legend>
                <div className="mt-2 space-y-2">
                  {question.options.map((option) => {
                    const selected = quizAnswers[question.id];
                    const checked = Array.isArray(selected)
                      ? selected.includes(option.id)
                      : selected === option.id;
                    return (
                      <label key={option.id} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type={question.questionType === "multiple" ? "checkbox" : "radio"}
                          name={`q-${question.id}`}
                          checked={checked}
                          onChange={() => {
                            if (question.questionType === "multiple") {
                              const current = Array.isArray(selected) ? selected : [];
                              const next = current.includes(option.id)
                                ? current.filter((id) => id !== option.id)
                                : [...current, option.id];
                              setQuizAnswers((prev) => ({ ...prev, [question.id]: next }));
                            } else {
                              setQuizAnswers((prev) => ({ ...prev, [question.id]: option.id }));
                            }
                          }}
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <Button
            type="button"
            className="mt-4"
            disabled={pending}
            onClick={() => {
              const fd = new FormData();
              fd.set("courseSlug", courseSlug);
              fd.set("answers", JSON.stringify(quizAnswers));
              run("quiz", submitQuizAction, fd);
            }}
          >
            Soumettre le quiz
          </Button>
        </section>
      ) : null}
    </div>
  );
}
