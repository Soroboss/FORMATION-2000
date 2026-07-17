"use client";

import { useState, useTransition } from "react";
import { submitTakedownAction, type TakedownActionResult } from "@/server/actions/takedown";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const inputClass =
  "w-full rounded-brand border border-canvas-border bg-canvas-card px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

export function TakedownForm() {
  const [result, setResult] = useState<TakedownActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  if (result?.success) {
    return (
      <Alert variant="success" className="mt-8">
        Votre demande a bien été enregistrée. Notre équipe vous répondra par e-mail sous
        quelques jours ouvrés.
      </Alert>
    );
  }

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          setResult(await submitTakedownAction(formData));
        });
      }}
      className="mt-8 space-y-4"
    >
      {result?.error ? <Alert variant="error">{result.error}</Alert> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="creatorName" className="mb-1 block text-sm font-medium text-ink-muted">
            Votre nom
          </label>
          <input id="creatorName" name="creatorName" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="creatorEmail" className="mb-1 block text-sm font-medium text-ink-muted">
            E-mail
          </label>
          <input id="creatorEmail" name="creatorEmail" type="email" required className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="videoUrl" className="mb-1 block text-sm font-medium text-ink-muted">
          URL de la vidéo concernée
        </label>
        <input id="videoUrl" name="videoUrl" type="url" required className={inputClass} placeholder="https://www.youtube.com/watch?v=…" />
      </div>
      <div>
        <label htmlFor="reason" className="mb-1 block text-sm font-medium text-ink-muted">
          Motif de la demande
        </label>
        <textarea id="reason" name="reason" required rows={4} className={inputClass} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer la demande"}
      </Button>
    </form>
  );
}
