import type { Metadata } from "next";
import Link from "next/link";
import { CategoryCard } from "@/components/learning/category-card";
import { listCategories, countPublishedCoursesByCategory } from "@/server/repositories/catalog";
import { hasInsForgePublicConfig } from "@/lib/insforge/server";
import { Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Catégories",
  description:
    "Explorez les catégories Learnoon Academy et choisissez le parcours qui correspond à vos objectifs.",
};

export default async function CategoriesPage() {
  const [categories, countById] = await Promise.all([
    listCategories(),
    countPublishedCoursesByCategory(),
  ]);

  return (
    <>
      <section className="border-b border-canvas-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="animate-fade-up text-sm font-semibold uppercase tracking-wide text-brand-600">
            Catalogue
          </p>
          <h1 className="animate-fade-up mt-2 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Choisissez votre domaine. Avancez avec méthode.
          </h1>
          <p className="animate-fade-up-delay-1 mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Chaque catégorie regroupe des parcours structurés pour monter en compétences
            rapidement — du premier pas au résultat concret.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/formations"
              className="inline-flex h-11 items-center rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Voir toutes les formations
            </Link>
            <Link
              href="/tarifs"
              className="inline-flex h-11 items-center rounded-brand border-2 border-brand-600 px-5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-canvas py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {!hasInsForgePublicConfig() ? (
            <p className="mb-8 rounded-soft border border-action-200 bg-action-50 px-4 py-3 text-sm text-action-800">
              Backend InsForge non configuré. Le catalogue apparaîtra après connexion et
              migrations.
            </p>
          ) : null}

          {categories.length === 0 ? (
            <div className="ui-card flex flex-col items-center px-6 py-14 text-center">
              <Compass className="h-10 w-10 text-brand-600" strokeWidth={2} aria-hidden />
              <h2 className="mt-4 font-display text-xl font-semibold text-ink">
                Catégories bientôt disponibles
              </h2>
              <p className="mt-2 max-w-md text-sm text-ink-muted">
                Les domaines de formation seront publiés ici. En attendant, créez votre compte
                pour être prêt dès le lancement.
              </p>
              <Link
                href="/inscription"
                className="mt-6 inline-flex h-11 items-center rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Créer mon compte
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink">
                    {categories.length} domaine{categories.length > 1 ? "s" : ""}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Sélectionnez une catégorie pour voir les formations associées.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category, index) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    index={index}
                    courseCount={countById[category.id] ?? 0}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="border-t border-canvas-border bg-brand-600 py-12 text-white sm:py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Une plateforme. Des centaines de compétences.
          </h2>
          <p className="mt-3 text-white/90">
            Accédez à tout le catalogue premium pour 2&nbsp;000&nbsp;FCFA / 30 jours.
          </p>
          <Link
            href="/inscription"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-brand bg-white px-8 text-base font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Commencer maintenant →
          </Link>
        </div>
      </section>
    </>
  );
}
