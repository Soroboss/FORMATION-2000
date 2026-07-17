import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hors ligne",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl">
        📡
      </div>
      <h1 className="font-display text-2xl font-bold text-ink">Vous êtes hors ligne</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        Impossible de charger cette page sans connexion. Vérifiez votre réseau puis réessayez.
        Les pages déjà ouvertes restent accessibles.
      </p>
      <Link
        href="/app/tableau-de-bord"
        className="inline-flex h-11 items-center rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Réessayer
      </Link>
    </main>
  );
}
