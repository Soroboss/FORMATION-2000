import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Compass, CreditCard } from "lucide-react";
import { CategoryCard } from "@/components/learning/category-card";
import { EnrollmentProgressCard } from "@/components/learning/continue-learning";
import { PageHeader, StatCard } from "@/components/app/page-header";
import { getSession } from "@/lib/auth/session";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";
import { getCourseById, listCategories, countPublishedCoursesByCategory } from "@/server/repositories/catalog";
import { listEnrollmentsForUser } from "@/server/repositories/learning";

export default async function MesFormationsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }

  const [enrollments, hasPremium, categories, courseCountByCategory] = await Promise.all([
    listEnrollmentsForUser(session.user.id),
    canAccessPremiumContent(session.user.id),
    listCategories(),
    countPublishedCoursesByCategory(),
  ]);

  const pairs = (
    await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await getCourseById(enrollment.courseId);
        return course ? { enrollment, course } : null;
      }),
    )
  ).filter((p): p is NonNullable<typeof p> => p !== null);

  const total = pairs.length;
  const completed = pairs.filter((p) => p.enrollment.status === "completed").length;
  const inProgress = total - completed;
  const avg =
    total === 0
      ? 0
      : Math.round(pairs.reduce((acc, p) => acc + p.enrollment.progressPercent, 0) / total);

  return (
    <section className="space-y-6">
      <PageHeader
        icon={BookOpen}
        title="Mes formations"
        subtitle="Vos formations commencées et votre progression. Une formation apparaît ici dès la première leçon ouverte."
        action={
          <Link
            href="/app/catalogue"
            className="inline-flex h-10 items-center gap-2 rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
          >
            <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
            Catalogue
          </Link>
        }
      />

      {total === 0 ? (
        <div className="space-y-6">
          <div className="ui-card border-dashed p-6 text-center sm:p-8">
            <p className="font-display text-lg font-semibold text-ink">
              Aucune formation dans votre espace
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
              {hasPremium
                ? "Choisissez une catégorie, ouvrez une formation, puis commencez une leçon."
                : "Explorez les catégories, puis activez l’abonnement pour regarder les leçons premium."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/app/catalogue"
                className="inline-flex h-11 items-center gap-2 rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
                Voir les catégories
              </Link>
              {!hasPremium ? (
                <Link
                  href="/paiement"
                  className="inline-flex h-11 items-center gap-2 rounded-brand border-2 border-brand-600 px-5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
                >
                  <CreditCard className="h-4 w-4" strokeWidth={2} aria-hidden />
                  S&apos;abonner — 2 000 FCFA
                </Link>
              ) : null}
            </div>
          </div>

          {categories.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 6).map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  hrefBase="/app/categories"
                  index={index}
                  courseCount={courseCountByCategory[category.id] ?? 0}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Formations" value={total} hint="dans votre espace" />
            <StatCard label="En cours" value={inProgress} tone="action" hint="à poursuivre" />
            <StatCard label="Terminées" value={completed} tone="progress" hint={`progression moyenne ${avg}%`} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pairs.map(({ enrollment, course }) => (
              <EnrollmentProgressCard
                key={enrollment.id}
                title={course.title}
                categoryName={course.category?.name}
                thumbnailUrl={course.thumbnailUrl}
                progressPercent={enrollment.progressPercent}
                href={`/app/formations/${course.slug}`}
                isCompleted={enrollment.status === "completed"}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
