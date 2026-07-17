"use client";

import { useState, useTransition } from "react";
import { createPlanAction, type PlanActionResult } from "@/server/actions/admin-plans";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const inputClass =
  "w-full rounded-brand border border-canvas-border bg-canvas-card px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

export function PlanForm() {
  const [result, setResult] = useState<PlanActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      id="plan-form"
      action={(formData) => {
        startTransition(async () => {
          const res = await createPlanAction(formData);
          setResult(res);
          if (res.success) {
            (document.getElementById("plan-form") as HTMLFormElement | null)?.reset();
          }
        });
      }}
      className="ui-card space-y-4 p-5 sm:p-6"
    >
      <h2 className="font-display text-lg font-bold text-ink">Nouvelle offre</h2>
      {result?.success ? (
        <Alert variant="success">Offre créée.</Alert>
      ) : result?.error ? (
        <Alert variant="error">{result.error}</Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink-muted">Nom</label>
          <input id="name" name="name" required className={inputClass} placeholder="Accès annuel" />
        </div>
        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-medium text-ink-muted">
            Slug (facultatif)
          </label>
          <input id="slug" name="slug" className={inputClass} placeholder="acces-annuel" />
        </div>
        <div>
          <label htmlFor="priceAmount" className="mb-1 block text-sm font-medium text-ink-muted">
            Prix
          </label>
          <input id="priceAmount" name="priceAmount" type="number" min={0} required className={inputClass} placeholder="20000" />
        </div>
        <div>
          <label htmlFor="currency" className="mb-1 block text-sm font-medium text-ink-muted">
            Devise
          </label>
          <input id="currency" name="currency" defaultValue="XOF" className={`${inputClass} uppercase`} />
        </div>
        <div>
          <label htmlFor="durationDays" className="mb-1 block text-sm font-medium text-ink-muted">
            Durée (jours)
          </label>
          <input id="durationDays" name="durationDays" type="number" min={1} defaultValue={30} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-ink-muted">
            Description
          </label>
          <input id="description" name="description" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="features" className="mb-1 block text-sm font-medium text-ink-muted">
            Avantages (un par ligne)
          </label>
          <textarea id="features" name="features" rows={3} className={inputClass} />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Création…" : "Créer l'offre"}
      </Button>
    </form>
  );
}
