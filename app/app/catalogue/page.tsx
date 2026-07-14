import Link from "next/link";
import { CatalogSearchForm } from "@/components/learning/catalog-search-form";
import { CategoryCard } from "@/components/learning/category-card";
import { CourseCard } from "@/components/learning/course-card";
import { getSession } from "@/lib/auth/session";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";
import { listCategories, listCourses } from "@/server/repositories/catalog";
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

  const [categories, courses] = await Promise.all([
    listCategories(),
    listCourses({
      q: params.q?.trim() || undefined,
      level,
    }),
  ]);

  return (
    <section className="space-y-8">
      <div className="ui-card p-5 sm:p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Catalogue</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Parcourez les catégories, choisissez une formation, puis{" "}
          {hasPremium
            ? "commencez une leçon pour l’ajouter à Mes formations."
            : "activez l’abonnement pour débloquer les leçons premium."}
        </p>
        {!hasPremium ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/paiement"
              className="inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              S&apos;abonner — 2 000 FCFA
            </Link>
            <Link
              href="/paiement/manuel"
              className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              Paiement WhatsApp
            </Link>
          </div>
        ) : null}
      </div>

      {categories.length > 0 && !params.q && !level ? (
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-ink">Catégories</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                hrefBase="/app/categories"
                index={index}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-ink">Formations</h2>
        <CatalogSearchForm
          action="/app/catalogue"
          defaultQuery={params.q ?? ""}
          defaultLevel={params.level ?? ""}
        />

        {courses.length === 0 ? (
          <p className="ui-card p-5 text-sm text-ink-muted">Aucune formation trouvée.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} hrefBase="/app/formations" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
