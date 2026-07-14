"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { forgotPasswordAction, type AuthActionResult } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [result, setResult] = useState<AuthActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  if (result?.success) {
    return (
      <div className="space-y-4">
        <Alert variant="success">
          Si un compte existe pour cet e-mail, un lien de réinitialisation vient d&apos;être
          envoyé.
        </Alert>
        <Link href="/connexion" className="block text-center text-sm font-semibold text-brand-700">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        startTransition(async () => {
          const res = await forgotPasswordAction(formData);
          setResult(res);
        });
      }}
    >
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      {result && !result.success ? <Alert variant="error">{result.error}</Alert> : null}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer le lien"}
      </Button>
    </form>
  );
}
