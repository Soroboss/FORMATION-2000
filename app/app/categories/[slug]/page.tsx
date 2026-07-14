import { notFound } from "next/navigation";
import { CourseCard } from "@/components/learning/course-card";
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

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">{category.name}</h1>
        {category.description ? (
          <p className="mt-1 text-sm text-slate-600">{category.description}</p>
        ) : null}
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} hrefBase="/app/formations" />
        ))}
      </div>
    </section>
  );
}
