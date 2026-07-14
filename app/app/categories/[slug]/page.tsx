import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { CourseCard } from "@/components/learning/course-card";
import { resolveCategoryIcon } from "@/lib/learning/category-icons";
import { getCategoryBySlug, listCourses } from "@/server/repositories/catalog";

export default async function AppCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const courses = await listCourses({ categorySlug: slug });
  const Icon = resolveCategoryIcon(category.icon ?? category.slug);

  return (
    <section className="space-y-6">
      <div className="ui-card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-soft bg-brand-50 text-brand-600">
            <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{category.name}</h1>
            {category.description ? (
              <p className="mt-1 text-sm text-ink-muted">{category.description}</p>
            ) : null}
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
              <BookOpen className="h-3.5 w-3.5 text-brand-600" strokeWidth={2} aria-hidden />
              {courses.length} formation{courses.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {courses.length === 0 ? (
        <p className="rounded-card border border-dashed border-canvas-border bg-white p-6 text-sm text-ink-muted">
          Aucune formation dans cette catégorie.{" "}
          <Link href="/app/catalogue" className="font-semibold text-brand-600 underline">
            Retour au catalogue
          </Link>
        </p>
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
