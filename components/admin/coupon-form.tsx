"use client";

import { useState, useTransition } from "react";
import { createCouponAction, type CouponActionResult } from "@/server/actions/coupons";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const inputClass =
  "h-11 w-full rounded-brand border border-canvas-border bg-canvas-card px-3 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

export function CouponForm({
  plans,
}: {
  plans: { id: string; name: string }[];
}) {
  const [result, setResult] = useState<CouponActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const res = await createCouponAction(formData);
          setResult(res);
          if (res.success) {
            (document.getElementById("coupon-form") as HTMLFormElement | null)?.reset();
          }
        });
      }}
      id="coupon-form"
      className="ui-card space-y-4 p-5 sm:p-6"
    >
      <h2 className="font-display text-lg font-bold text-ink">Nouveau code promo</h2>

      {result?.success ? (
        <Alert variant="success">Code promo créé.</Alert>
      ) : result?.error ? (
        <Alert variant="error">{result.error}</Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="code" className="mb-1 block text-sm font-medium text-ink-muted">
            Code
          </label>
          <input id="code" name="code" required className={`${inputClass} uppercase`} placeholder="BIENVENUE" />
        </div>
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-ink-muted">
            Description
          </label>
          <input id="description" name="description" className={inputClass} placeholder="Offre de lancement" />
        </div>
        <div>
          <label htmlFor="discountType" className="mb-1 block text-sm font-medium text-ink-muted">
            Type
          </label>
          <select id="discountType" name="discountType" className={inputClass} defaultValue="percent">
            <option value="percent">Pourcentage (%)</option>
            <option value="fixed">Montant fixe</option>
          </select>
        </div>
        <div>
          <label htmlFor="discountValue" className="mb-1 block text-sm font-medium text-ink-muted">
            Valeur
          </label>
          <input id="discountValue" name="discountValue" type="number" min={1} required className={inputClass} placeholder="20" />
        </div>
        <div>
          <label htmlFor="planId" className="mb-1 block text-sm font-medium text-ink-muted">
            Offre concernée
          </label>
          <select id="planId" name="planId" className={inputClass} defaultValue="">
            <option value="">Toutes les offres</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="maxRedemptions" className="mb-1 block text-sm font-medium text-ink-muted">
            Limite d&apos;utilisations
          </label>
          <input id="maxRedemptions" name="maxRedemptions" type="number" min={1} className={inputClass} placeholder="Illimité si vide" />
        </div>
        <div>
          <label htmlFor="startsAt" className="mb-1 block text-sm font-medium text-ink-muted">
            Début (facultatif)
          </label>
          <input id="startsAt" name="startsAt" type="date" className={inputClass} />
        </div>
        <div>
          <label htmlFor="endsAt" className="mb-1 block text-sm font-medium text-ink-muted">
            Fin (facultatif)
          </label>
          <input id="endsAt" name="endsAt" type="date" className={inputClass} />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Création…" : "Créer le code promo"}
      </Button>
    </form>
  );
}
