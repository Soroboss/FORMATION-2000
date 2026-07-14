"use client";

import { useState, useTransition } from "react";
import { startCheckoutAction, type CheckoutActionResult } from "@/server/actions/payments";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function CheckoutButton({
  planSlug = "acces-mensuel",
  label = "Payer 2 000 FCFA",
}: {
  planSlug?: string;
  label?: string;
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
      {result && !result.success ? (
        <Alert variant="error" className="mb-3">
          {result.error}
        </Alert>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Redirection…" : label}
      </Button>
    </form>
  );
}
