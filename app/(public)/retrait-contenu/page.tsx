import type { Metadata } from "next";

export const metadata: Metadata = { title: "Retrait de contenu" };

export default function RetraitContenuPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-slate-900">
        Demande de retrait de contenu
      </h1>
      <p className="mt-6 text-slate-700">
        Les créateurs peuvent demander le retrait d&apos;une vidéo référencée. Le formulaire
        complet sera disponible en Phase 5. Contactez le support en attendant.
      </p>
    </section>
  );
}
