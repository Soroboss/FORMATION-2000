import type { Metadata } from "next";
import Link from "next/link";
import { CatalogSearchForm } from "@/components/learning/catalog-search-form";
import { CourseCard } from "@/components/learning/course-card";
import { CourseRail } from "@/components/learning/course-rail";
import { getPublicCatalogSections, listCourses } from "@/server/repositories/catalog";
import type { CourseLevel } from "@/types/catalog";
import { hasInsForgePublicConfig } from "@/lib/insforge/server";

export const metadata: Metadata = {
  title: "Formations",
  description: "Catalogue public des formations Learnoon Academy.",
};

export default async function FormationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; level?: string }>;
}) {
  const params = await searchParams;
  const level =
    params.level === "beginner" ||
    params.level === "intermediate" ||
    params.level === "advanced"
      ? (params.level as CourseLevel)
      : undefined;

  const query = params.q?.trim() || undefined;
  const isBrowsing = !query && !level;

  // Mode navigation (sans filtre) → sections ; sinon → résultats filtrés.
  const sections = isBrowsing ? await getPublicCatalogSections() : null;
  const filtered = isBrowsing ? [] : await listCourses({ q: query, level });

  return (
    <>
      <section className="border-b border-canvas-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Catalogue</p>
          <h1 className="mt-2 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Toutes les formations
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Parcours curés, structurés et prêts à pratiquer. Les leçons premium s&apos;ouvrent avec
            un abonnement actif.
          </p>
          <div className="mt-6">
            <CatalogSearchForm
              action="/formations"
              defaultQuery={params.q ?? ""}
              defaultLevel={params.level ?? ""}
            />
          </div>
        </div>
      </section>

      <section className="bg-canvas py-10 sm:py-14">
        <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6">
          {!hasInsForgePublicConfig() ? (
            <p className="rounded-soft border border-action-200 bg-action-50 px-4 py-3 text-sm text-action-800">
              Backend InsForge non configuré. Ajoutez les variables dans `.env.local` puis appliquez
              les migrations pour afficher le catalogue.
            </p>
          ) : null}

          {isBrowsing && sections ? (
            sections.all.length === 0 ? (
              <p className="text-sm text-ink-muted">Aucune formation publiée pour le moment.</p>
            ) : (
              <>
                <CourseRail
                  eyebrow="À la une"
                  title="Formations mises en avant"
                  subtitle="Notre sélection du moment."
                  courses={sections.featured}
                />
                <CourseRail
                  eyebrow="Nouveautés"
                  title="Dernières formations"
                  subtitle="Les ajouts les plus récents au catalogue."
                  courses={sections.newest}
                />
                <CourseRail
                  eyebrow="Populaires"
                  title="Les plus suivies"
                  subtitle="Ce que les autres apprenants regardent le plus."
                  courses={sections.popular}
                />

                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
                      Tout le catalogue
                    </h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      {sections.all.length} formation{sections.all.length > 1 ? "s" : ""} disponible
                      {sections.all.length > 1 ? "s" : ""}.
                    </p>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {sections.all.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </div>
              </>
            )
          ) : filtered.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-ink-muted">
                {query
                  ? `Aucune formation ne correspond à « ${query} ».`
                  : "Aucune formation ne correspond à votre recherche."}
              </p>
              <Link
                href="/formations"
                className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
              >
                Réinitialiser
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-ink-muted">
                {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
                {query ? ` pour « ${query} »` : ""}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
