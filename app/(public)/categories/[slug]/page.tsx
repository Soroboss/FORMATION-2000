import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseCard } from "@/components/learning/course-card";
import { CategoryHero } from "@/components/learning/category-hero";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildCategoryJsonLd,
  buildCategoryMetadata,
} from "@/lib/seo/category-metadata";
import { getCategoryBySlug, listCategoryCoursesRanked } from "@/server/repositories/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Catégorie introuvable" };
  return buildCategoryMetadata(category);
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const courses = await listCategoryCoursesRanked(slug);

  return (
    <>
      <JsonLd data={buildCategoryJsonLd(category, courses.length)} />

      <CategoryHero
        category={category}
        courseCount={courses.length}
        backHref="/categories"
        backLabel="Toutes les catégories"
        showDefaultActions
      />

      <section className="bg-canvas py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {courses.length === 0 ? (
            <div className="ui-card px-6 py-12 text-center">
              <h2 className="font-display text-xl font-semibold text-ink">
                Aucune formation publiée pour le moment
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                Revenez bientôt ou explorez d&apos;autres catégories.
              </p>
              <Link
                href="/categories"
                className="mt-6 inline-flex h-11 items-center rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Retour aux catégories
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold text-ink">Formations</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Classées par pertinence — commencez par le haut et suivez le parcours.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
