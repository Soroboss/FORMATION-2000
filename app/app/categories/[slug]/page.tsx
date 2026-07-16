import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard } from "lucide-react";
import { CourseCard } from "@/components/learning/course-card";
import { CategoryHero } from "@/components/learning/category-hero";
import { getSession } from "@/lib/auth/session";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";
import { getCategoryBySlug, listCategoryCoursesRanked } from "@/server/repositories/catalog";

export default async function AppCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const session = await getSession();
  const [courses, hasPremium] = await Promise.all([
    listCategoryCoursesRanked(slug),
    canAccessPremiumContent(session?.user.id),
  ]);

  return (
    <section className="space-y-6">
      <CategoryHero
        category={category}
        courseCount={courses.length}
        backHref="/app/catalogue"
        backLabel="Toutes les catégories"
        variant="app"
        actions={
          !hasPremium ? (
            <div className="rounded-soft border border-action-200 bg-action-50 p-4">
              <p className="text-sm text-ink-muted">
                Choisissez une formation ci-dessous. Pour regarder les leçons premium et
                l&apos;installer dans Mes formations, activez l&apos;accès mensuel.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/paiement"
                  className="inline-flex h-10 items-center gap-2 rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  <CreditCard className="h-4 w-4" strokeWidth={2} aria-hidden />
                  S&apos;abonner — 2 000 FCFA
                </Link>
                <Link
                  href="/paiement/manuel"
                  className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-white"
                >
                  WhatsApp / Mobile Money
                </Link>
              </div>
            </div>
          ) : null
        }
        footer={
          <p className="text-xs text-ink-muted">
            <Link href="/app/catalogue" className="font-semibold text-brand-600 hover:underline">
              ← Toutes les catégories
            </Link>
          </p>
        }
      />

      {courses.length === 0 ? (
        <p className="ui-card border-dashed p-6 text-sm text-ink-muted">
          Aucune formation dans cette catégorie.{" "}
          <Link href="/app/catalogue" className="font-semibold text-brand-600 underline">
            Retour au catalogue
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">
            Classées par pertinence — commencez par le haut et suivez le parcours.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} hrefBase="/app/formations" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
