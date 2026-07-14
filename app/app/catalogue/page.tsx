import { CatalogSearchForm } from "@/components/learning/catalog-search-form";
import { CourseCard } from "@/components/learning/course-card";
import { listCourses } from "@/server/repositories/catalog";
import type { CourseLevel } from "@/types/catalog";

export default async function AppCataloguePage({
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

  const courses = await listCourses({
    q: params.q?.trim() || undefined,
    level,
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Catalogue</h1>
        <p className="mt-1 text-sm text-slate-600">
          Explorez les formations publiées. Les aperçus sont gratuitement accessibles.
        </p>
      </div>

      <CatalogSearchForm
        action="/app/catalogue"
        defaultQuery={params.q ?? ""}
        defaultLevel={params.level ?? ""}
      />

      {courses.length === 0 ? (
        <p className="text-sm text-slate-600">Aucune formation trouvée.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} hrefBase="/app/formations" />
          ))}
        </div>
      )}
    </section>
  );
}
