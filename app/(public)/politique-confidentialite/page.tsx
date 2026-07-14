import type { Metadata } from "next";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function ConfidentialitePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-slate-900">
        Politique de confidentialité
      </h1>
      <p className="mt-6 text-slate-700">
        Version provisoire. Nous collectons uniquement les données nécessaires au compte,
        à l&apos;abonnement et au suivi pédagogique. Les obligations légales exactes seront
        validées avec un professionnel compétent avant le lancement.
      </p>
    </section>
  );
}
