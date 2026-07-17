"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { loginAction, type AuthActionResult } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [result, setResult] = useState<AuthActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        startTransition(async () => {
          const res = await loginAction(formData);
          setResult(res);
        });
      }}
    >
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

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
        <div className="mb-1.5 flex items-center justify-between">
          <Label htmlFor="password" className="mb-0">
            Mot de passe
          </Label>
          <Link
            href="/mot-de-passe-oublie"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {result && !result.success ? <Alert variant="error">{result.error}</Alert> : null}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-brand-700 hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
