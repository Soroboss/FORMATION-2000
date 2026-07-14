import Link from "next/link";
import { CategoryCard } from "@/components/learning/category-card";
import { CourseCard } from "@/components/learning/course-card";
import { getAppName } from "@/lib/utils";
import { listCategories, listCourses } from "@/server/repositories/catalog";

export default async function HomePage() {
  const appName = getAppName();
  const [categories, featured] = await Promise.all([
    listCategories(),
    listCourses({ featured: true }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <p className="font-display text-4xl font-bold tracking-tight text-brand-900 sm:text-5xl lg:text-6xl">
              {appName}
            </p>
            <h1 className="mt-4 max-w-xl text-2xl font-semibold text-slate-900 sm:text-3xl">
              Entrez sans compétence, ressortez capable de produire un résultat concret.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Parcours structurés, vidéos YouTube sélectionnées, exercices pratiques et suivi de
              progression — pour 2&nbsp;000&nbsp;FCFA et 30 jours d&apos;accès.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/inscription"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-action-600 px-6 text-base font-semibold text-white hover:bg-action-700"
              >
                Accéder pour 2 000 FCFA
              </Link>
              <Link
                href="/formations"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-brand-200 bg-white px-6 text-base font-semibold text-brand-900 hover:bg-brand-50"
              >
                Voir les formations
              </Link>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="relative min-h-[280px] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-action-500 shadow-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_45%)]" />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/15 p-5 text-white backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-white/80">Méthode</p>
              <p className="mt-2 font-display text-2xl font-semibold">Voir · Pratiquer · Valider</p>
              <p className="mt-2 text-sm text-white/85">
                Une leçon, une mission, une progression mesurable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-slate-900">
              Catégories populaires
            </h2>
            <Link href="/categories" className="text-sm font-semibold text-brand-700 hover:underline">
              Tout voir
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 3).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      ) : null}

      {featured.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-slate-900">
              Formations populaires
            </h2>
            <Link href="/formations" className="text-sm font-semibold text-brand-700 hover:underline">
              Catalogue
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
