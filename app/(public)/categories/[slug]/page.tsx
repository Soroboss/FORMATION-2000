import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseCard } from "@/components/learning/course-card";
import { getCategoryBySlug, listCourses } from "@/server/repositories/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Catégorie introuvable" };
  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const courses = await listCourses({ categorySlug: slug });

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-slate-900">{category.name}</h1>
      {category.description ? (
        <p className="mt-3 max-w-2xl text-slate-600">{category.description}</p>
      ) : null}

      {courses.length === 0 ? (
        <p className="mt-10 text-sm text-slate-600">Aucune formation publiée dans cette catégorie.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}
