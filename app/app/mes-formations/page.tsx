import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass, CreditCard } from "lucide-react";
import { CategoryCard } from "@/components/learning/category-card";
import { getSession } from "@/lib/auth/session";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";
import { getCourseById, listCategories } from "@/server/repositories/catalog";
import { listEnrollmentsForUser } from "@/server/repositories/learning";

export default async function MesFormationsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }

  const [enrollments, hasPremium, categories] = await Promise.all([
    listEnrollmentsForUser(session.user.id),
    canAccessPremiumContent(session.user.id),
    listCategories(),
  ]);

  const courses = await Promise.all(
    enrollments.map(async (enrollment) => {
      const course = await getCourseById(enrollment.courseId);
      return { enrollment, course };
    }),
  );

  return (
    <section className="space-y-6">
      <div className="ui-card p-5 sm:p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Mes formations</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Formations commencées et progression associée. Une formation apparaît ici dès que vous
          ouvrez une leçon accessible.
        </p>
      </div>

      {courses.length === 0 ? (
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
            <div className="grid gap-4 sm:grid-cols-2">
              {categories.slice(0, 4).map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  hrefBase="/app/categories"
                  index={index}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-3">
          {courses.map(({ enrollment, course }) => (
            <li key={enrollment.id} className="ui-card p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display font-semibold text-ink">
                    {course?.title ?? "Formation"}
                  </h2>
                  <p className="mt-1 text-xs text-ink-muted">
                    <span className="font-semibold text-progress-600">
                      {enrollment.progressPercent}%
                    </span>{" "}
                    · {enrollment.status}
                  </p>
                </div>
                {course ? (
                  <Link
                    href={`/app/formations/${course.slug}`}
                    className="inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Continuer
                  </Link>
                ) : null}
              </div>
              <div className="progress-bar mt-3">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${enrollment.progressPercent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
