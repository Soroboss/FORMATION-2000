"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LearnerAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] error", error);
  }, [error]);

  return (
    <section className="ui-card mx-auto max-w-lg p-6 text-center sm:p-8">
      <h1 className="font-display text-xl font-bold text-ink">Impossible d&apos;afficher cette page</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Une erreur est survenue dans votre espace apprenant. Réessayez ou reconnectez-vous.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset}>
          Réessayer
        </Button>
        <Link
          href="/connexion?next=/app/tableau-de-bord"
          className="inline-flex h-11 items-center rounded-brand border-2 border-brand-600 px-5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
        >
          Se reconnecter
        </Link>
      </div>
    </section>
  );
}
