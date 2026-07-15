import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { CourseCard } from "@/components/learning/course-card";
import { resolveCategoryEmoji, resolveCategoryIcon } from "@/lib/learning/category-icons";
import { getCategoryBySlug, listCourses } from "@/server/repositories/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Catégorie introuvable" };
  return {
    title: category.name,
    description:
      category.description ??
      `Formations ${category.name} sur Learnoon Academy — parcours structurés et accès premium.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const courses = await listCourses({ categorySlug: slug });
  const Icon = resolveCategoryIcon(category.icon ?? category.slug);
  const emoji = resolveCategoryEmoji(category.slug);

  return (
    <>
      <section className="border-b border-canvas-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
            Toutes les catégories
          </Link>

          {category.imageUrl ? (
            <div
              className="mt-6 aspect-[21/9] w-full max-w-3xl overflow-hidden rounded-card bg-cover bg-center sm:aspect-[3/1]"
              style={{ backgroundImage: `url(${category.imageUrl})` }}
              role="img"
              aria-label={category.name}
            />
          ) : null}

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-brand-50 text-2xl text-brand-600">
              {emoji ?? <Icon className="h-7 w-7" strokeWidth={2} aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                Catégorie
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {category.name}
              </h1>
              {category.description ? (
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted">
                  {category.description}
                </p>
              ) : null}
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink-muted">
                <BookOpen className="h-4 w-4 text-brand-600" strokeWidth={2} aria-hidden />
                {courses.length} formation{courses.length > 1 ? "s" : ""} disponible
                {courses.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/inscription"
              className="inline-flex h-11 items-center justify-center rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Accéder pour 2 000 FCFA
            </Link>
            <Link
              href="/tarifs"
              className="inline-flex h-11 items-center justify-center rounded-brand border-2 border-brand-600 px-5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              Voir l&apos;offre
            </Link>
          </div>
        </div>
      </section>

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
                  Sélectionnez une formation pour voir le parcours et démarrer.
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
