"use client";

import { useState } from "react";
import { addQuestionAction } from "@/server/actions/admin-quiz";
import { Button } from "@/components/ui/button";

type QuestionType = "single" | "multiple" | "true_false" | "short";

const inputClass =
  "w-full rounded-brand border border-canvas-border bg-canvas-card px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

export function QuizQuestionForm({ quizId }: { quizId: string }) {
  const [type, setType] = useState<QuestionType>("single");

  return (
    <form action={addQuestionAction} className="ui-card space-y-4 p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold text-ink">Ajouter une question</h2>
      <input type="hidden" name="quizId" value={quizId} />

      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <div>
          <label htmlFor="questionType" className="mb-1 block text-sm font-medium text-ink-muted">
            Type
          </label>
          <select
            id="questionType"
            name="questionType"
            value={type}
            onChange={(e) => setType(e.target.value as QuestionType)}
            className={inputClass}
          >
            <option value="single">Choix unique</option>
            <option value="multiple">Choix multiple</option>
            <option value="true_false">Vrai / Faux</option>
            <option value="short">Réponse courte</option>
          </select>
        </div>
        <div>
          <label htmlFor="points" className="mb-1 block text-sm font-medium text-ink-muted">
            Points
          </label>
          <input id="points" name="points" type="number" min={0} defaultValue={1} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="question" className="mb-1 block text-sm font-medium text-ink-muted">
          Énoncé
        </label>
        <textarea id="question" name="question" required rows={2} className={inputClass} />
      </div>

      {(type === "single" || type === "multiple") && (
        <div>
          <label htmlFor="options" className="mb-1 block text-sm font-medium text-ink-muted">
            Options (une par ligne, préfixez la bonne réponse par <span className="font-mono">*</span>)
          </label>
          <textarea
            id="options"
            name="options"
            rows={4}
            placeholder={"*Bonne réponse\nMauvaise réponse\nAutre proposition"}
            className={`${inputClass} font-mono`}
          />
        </div>
      )}

      {type === "true_false" && (
        <div>
          <label htmlFor="correctBool" className="mb-1 block text-sm font-medium text-ink-muted">
            Bonne réponse
          </label>
          <select id="correctBool" name="correctBool" className={inputClass} defaultValue="true">
            <option value="true">Vrai</option>
            <option value="false">Faux</option>
          </select>
        </div>
      )}

      {type === "short" && (
        <div>
          <label htmlFor="expectedAnswer" className="mb-1 block text-sm font-medium text-ink-muted">
            Réponse attendue
          </label>
          <input id="expectedAnswer" name="expectedAnswer" className={inputClass} />
        </div>
      )}

      <div>
        <label htmlFor="explanation" className="mb-1 block text-sm font-medium text-ink-muted">
          Explication (facultatif)
        </label>
        <textarea id="explanation" name="explanation" rows={2} className={inputClass} />
      </div>

      <Button type="submit">Ajouter la question</Button>
    </form>
  );
}
