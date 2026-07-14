import type { Metadata } from "next";

export const metadata: Metadata = { title: "À propos" };

export default function Page() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink">À propos</h1>
      <p className="mt-4 text-base leading-relaxed text-ink-muted">
        Learnoon Academy est une plateforme d&apos;apprentissage en ligne nouvelle génération qui
        démocratise l&apos;accès aux meilleures formations grâce à un abonnement simple, abordable
        et accessible à tous.
      </p>
      <p className="mt-4 text-base leading-relaxed text-ink">
        Elle représente l&apos;apprentissage continu, la réussite professionnelle, la montée en
        compétences, et la technologie au service de l&apos;éducation — l&apos;excellence
        accessible.
      </p>
      <p className="mt-6 font-display text-lg font-semibold text-ink">
        Apprends aujourd&apos;hui.{" "}
        <span className="text-progress-600">Réussis demain.</span>
      </p>
    </section>
  );
}
