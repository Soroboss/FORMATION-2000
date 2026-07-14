"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "app_error",
        digest: error.digest ?? null,
        message: error.message,
      }),
    );
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-2xl font-semibold text-slate-900">
        Une erreur est survenue
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Réessayez, ou revenez à l&apos;accueil. Si le problème continue, contactez le support.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-slate-400">Réf. {error.digest}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset}>
          Réessayer
        </Button>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-lg border border-brand-200 px-5 text-sm font-semibold text-brand-900 hover:bg-brand-50"
        >
          Accueil
        </Link>
      </div>
    </main>
  );
}
