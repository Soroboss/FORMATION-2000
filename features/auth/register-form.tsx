"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { registerAction, type AuthActionResult } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function RegisterForm() {
  const [result, setResult] = useState<AuthActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  if (result?.success && result.requireEmailVerification) {
    return (
      <Alert variant="success">
        Compte créé. Vérifiez votre e-mail pour activer l&apos;accès, puis{" "}
        <Link href="/connexion" className="font-semibold underline">
          connectez-vous
        </Link>
        .
      </Alert>
    );
  }

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        startTransition(async () => {
          const res = await registerAction(formData);
          setResult(res);
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">Prénom</Label>
          <Input id="firstName" name="firstName" required autoComplete="given-name" />
        </div>
        <div>
          <Label htmlFor="lastName">Nom</Label>
          <Input id="lastName" name="lastName" required autoComplete="family-name" />
        </div>
      </div>

      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="vous@exemple.com"
        />
      </div>

      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <p className="mt-1 text-xs text-slate-500">Minimum 8 caractères.</p>
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="acceptTerms"
          value="true"
          required
          className="mt-1 h-4 w-4 rounded border-slate-300"
        />
        <span>
          J&apos;accepte les{" "}
          <Link href="/conditions-utilisation" className="font-medium text-brand-700 underline">
            conditions d&apos;utilisation
          </Link>
          .
        </span>
      </label>

      {result && !result.success ? <Alert variant="error">{result.error}</Alert> : null}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Création…" : "Créer mon compte"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-brand-700 hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
