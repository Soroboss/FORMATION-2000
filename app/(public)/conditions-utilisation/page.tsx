import type { Metadata } from "next";

function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-slate-900">{title}</h1>
      <div className="prose prose-slate mt-6 max-w-none text-slate-700">{children}</div>
    </section>
  );
}

export const metadata: Metadata = { title: "Conditions d'utilisation" };

export default function ConditionsPage() {
  return (
    <LegalPage title="Conditions d'utilisation">
      <p>
        Version provisoire Phase 1. Les conditions définitives seront validées avant le
        lancement commercial (Phase 7). L&apos;abonnement donne accès à la plateforme
        pédagogique, pas à la propriété des vidéos YouTube intégrées.
      </p>
    </LegalPage>
  );
}
