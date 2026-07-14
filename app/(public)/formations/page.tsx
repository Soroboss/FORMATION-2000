import type { Metadata } from "next";
import { CatalogSearchForm } from "@/components/learning/catalog-search-form";
import { CourseCard } from "@/components/learning/course-card";
import { listCourses } from "@/server/repositories/catalog";
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

  const courses = await listCourses({
    q: params.q?.trim() || undefined,
    level,
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-slate-900">Formations</h1>
        <p className="mt-3 text-slate-600">
          Parcours curés, structurés et prêts à pratiquer. Les leçons premium s&apos;ouvrent avec
          un abonnement actif.
        </p>
      </div>

      <div className="mt-8">
        <CatalogSearchForm
          action="/formations"
          defaultQuery={params.q ?? ""}
          defaultLevel={params.level ?? ""}
        />
      </div>

      {!hasInsForgePublicConfig() ? (
        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Backend InsForge non configuré. Ajoutez les variables dans `.env.local` puis appliquez
          les migrations pour afficher le catalogue.
        </p>
      ) : null}

      {courses.length === 0 ? (
        <p className="mt-10 text-sm text-slate-600">Aucune formation ne correspond à votre recherche.</p>
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
