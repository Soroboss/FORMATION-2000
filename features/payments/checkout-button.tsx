"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { startCheckoutAction, type CheckoutActionResult } from "@/server/actions/payments";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function CheckoutButton({
  planSlug = "acces-mensuel",
  label = "Payer 2 000 FCFA",
  allowCoupon = true,
}: {
  planSlug?: string;
  label?: string;
  allowCoupon?: boolean;
}) {
  const [result, setResult] = useState<CheckoutActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const res = await startCheckoutAction(formData);
          setResult(res);
        });
      }}
    >
      <input type="hidden" name="planSlug" value={planSlug} />
      {allowCoupon ? (
        <div className="mb-3">
          <label
            htmlFor="couponCode"
            className="mb-1 block text-sm font-medium text-ink-muted"
          >
            Code promo (facultatif)
          </label>
          <input
            id="couponCode"
            name="couponCode"
            type="text"
            autoCapitalize="characters"
            autoComplete="off"
            placeholder="EX : BIENVENUE"
            className="h-11 w-full rounded-brand border border-canvas-border bg-canvas-card px-3 text-sm uppercase text-ink placeholder:text-ink-muted/60 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
      ) : null}
      {result && !result.success ? (
        <Alert variant="error" className="mb-3">
          <p>{result.error}</p>
          {result.fallbackManual ? (
            <p className="mt-2">
              <Link href="/paiement/manuel" className="font-semibold underline">
                Continuer avec Mobile Money + WhatsApp
              </Link>
            </p>
          ) : null}
        </Alert>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Redirection…" : label}
      </Button>
    </form>
  );
}
