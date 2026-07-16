import Link from "next/link";
import { CreditCard, LayoutGrid, Lock } from "lucide-react";
import { CatalogSearchForm } from "@/components/learning/catalog-search-form";
import { CategoryCard } from "@/components/learning/category-card";
import { CourseCard } from "@/components/learning/course-card";
import { CourseRail } from "@/components/learning/course-rail";
import { PageHeader } from "@/components/app/page-header";
import { getSession } from "@/lib/auth/session";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";
import {
  getPublicCatalogSections,
  listCategories,
  listCourses,
  countPublishedCoursesByCategory,
} from "@/server/repositories/catalog";
import type { CourseLevel } from "@/types/catalog";

export default async function AppCataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; level?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const hasPremium = session ? await canAccessPremiumContent(session.user.id) : false;

  const level =
    params.level === "beginner" ||
    params.level === "intermediate" ||
    params.level === "advanced"
      ? (params.level as CourseLevel)
      : undefined;

  const query = params.q?.trim() || undefined;
  const isBrowsing = !query && !level;

  const [categories, courseCountByCategory, sections, filtered] = await Promise.all([
    listCategories(),
    countPublishedCoursesByCategory(),
    isBrowsing ? getPublicCatalogSections() : Promise.resolve(null),
    isBrowsing ? Promise.resolve([]) : listCourses({ q: query, level }),
  ]);

  return (
    <section className="space-y-10">
      <PageHeader
        icon={LayoutGrid}
        title="Catalogue"
        subtitle={
          hasPremium
            ? "Parcourez les catégories, choisissez une formation, puis commencez une leçon pour l’ajouter à Mes formations."
            : "Parcourez les catégories et choisissez une formation. Activez l’abonnement pour débloquer les leçons premium."
        }
      />

      {!hasPremium ? (
        <div className="ui-card flex flex-col gap-3 border-action-200 bg-action-50/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-soft bg-action-500 text-white">
              <Lock className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
            <p className="text-sm text-ink-muted">
              <span className="font-semibold text-ink">2 000 FCFA / 30 jours</span> pour
              débloquer toutes les leçons premium.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/paiement"
              className="inline-flex h-10 items-center gap-2 rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <CreditCard className="h-4 w-4" strokeWidth={2} aria-hidden />
              S&apos;abonner
            </Link>
            <Link
              href="/paiement/manuel"
              className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-white"
            >
              WhatsApp / Mobile Money
            </Link>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <CatalogSearchForm
          action="/app/catalogue"
          defaultQuery={params.q ?? ""}
          defaultLevel={params.level ?? ""}
        />
      </div>

      {isBrowsing && sections ? (
        <>
          {categories.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">Catégories</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map((category, index) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    hrefBase="/app/categories"
                    index={index}
                    courseCount={courseCountByCategory[category.id] ?? 0}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {sections.all.length === 0 ? (
            <p className="ui-card p-5 text-sm text-ink-muted">Aucune formation trouvée.</p>
          ) : (
            <>
              <CourseRail
                eyebrow="À la une"
                title="Formations mises en avant"
                courses={sections.featured}
                hrefBase="/app/formations"
              />
              <CourseRail
                eyebrow="Nouveautés"
                title="Dernières formations"
                courses={sections.newest}
                hrefBase="/app/formations"
              />
              <CourseRail
                eyebrow="Populaires"
                title="Les plus suivies"
                courses={sections.popular}
                hrefBase="/app/formations"
              />

              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
                  Tout le catalogue
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {sections.all.map((course) => (
                    <CourseCard key={course.id} course={course} hrefBase="/app/formations" />
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      ) : filtered.length === 0 ? (
        <p className="ui-card p-5 text-sm text-ink-muted">
          {query
            ? `Aucune formation ne correspond à « ${query} ». Essayez un autre mot-clé (titre, thème, outil…).`
            : "Aucune formation trouvée."}
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
            {query ? ` pour « ${query} »` : ""}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} hrefBase="/app/formations" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
