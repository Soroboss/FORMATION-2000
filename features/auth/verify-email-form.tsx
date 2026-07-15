"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  resendVerificationEmailAction,
  verifyEmailAction,
  type AuthActionResult,
} from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function VerifyEmailForm({ email }: { email: string }) {
  const [result, setResult] = useState<AuthActionResult | null>(null);
  const [resendOk, setResendOk] = useState(false);
  const [pending, startTransition] = useTransition();
  const [resendPending, startResend] = useTransition();

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Un code à 6 chiffres a été envoyé à{" "}
        <span className="font-semibold text-slate-900">{email}</span>. Saisissez-le ci-dessous
        pour activer votre compte.
      </p>

      <form
        className="space-y-4"
        action={(formData) => {
          startTransition(async () => {
            const res = await verifyEmailAction(formData);
            setResult(res);
          });
        }}
      >
        <input type="hidden" name="email" value={email} />
        <div>
          <Label htmlFor="otp">Code de vérification</Label>
          <Input
            id="otp"
            name="otp"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            placeholder="123456"
            autoComplete="one-time-code"
          />
        </div>
        {result && !result.success ? <Alert variant="error">{result.error}</Alert> : null}
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Vérification…" : "Valider mon e-mail"}
        </Button>
      </form>

      <form
        action={(formData) => {
          startResend(async () => {
            const res = await resendVerificationEmailAction(formData);
            setResendOk(res.success);
            setResult(res.success ? null : res);
          });
        }}
      >
        <input type="hidden" name="email" value={email} />
        <Button type="submit" variant="secondary" className="w-full" disabled={resendPending}>
          {resendPending ? "Envoi…" : "Renvoyer le code"}
        </Button>
      </form>

      {resendOk ? (
        <Alert variant="success">Un nouveau code a été envoyé si l&apos;e-mail existe.</Alert>
      ) : null}

      <p className="text-center text-sm text-slate-600">
        Déjà vérifié ?{" "}
        <Link href="/connexion" className="font-semibold text-brand-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
