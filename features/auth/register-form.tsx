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
        <Link href="/verifier-email" className="font-semibold underline">
          saisissez le code
        </Link>{" "}
        ou{" "}
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
        <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
        <Input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="Ex. +225 07 XX XX XX XX"
        />
        <p className="mt-1 text-xs text-ink-muted">
          Utilisé pour le suivi d&apos;inscription et la confirmation des paiements Mobile Money.
        </p>
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
        <p className="mt-1 text-xs text-ink-muted">Minimum 8 caractères.</p>
      </div>

      <fieldset className="rounded-soft border border-canvas-border bg-canvas px-3 py-3">
        <legend className="px-1 font-display text-sm font-semibold text-ink">
          Conditions d&apos;utilisation
        </legend>
        <label className="mt-1 flex items-start gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="acceptTerms"
            value="true"
            required
            className="mt-1 h-4 w-4 rounded border-canvas-border text-brand-600 focus:ring-brand-600"
          />
          <span>
            J&apos;ai lu et j&apos;accepte les{" "}
            <Link
              href="/conditions-utilisation"
              target="_blank"
              className="font-semibold text-brand-600 underline"
            >
              Conditions d&apos;utilisation
            </Link>{" "}
            et la{" "}
            <Link
              href="/politique-confidentialite"
              target="_blank"
              className="font-semibold text-brand-600 underline"
            >
              Politique de confidentialité
            </Link>{" "}
            de Learnoon Academy. Je confirme que les informations fournies sont exactes.
          </span>
        </label>
      </fieldset>

      {result && !result.success ? <Alert variant="error">{result.error}</Alert> : null}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Création…" : "Créer mon compte"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-brand-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
