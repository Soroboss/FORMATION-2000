import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass, CreditCard, Lock } from "lucide-react";
import { CategoryCard } from "@/components/learning/category-card";
import {
  ContinueLearningHero,
  EnrollmentProgressCard,
} from "@/components/learning/continue-learning";
import { getSession } from "@/lib/auth/session";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";
import {
  getCourseById,
  getLessonAppPath,
  listCategories,
  countPublishedCoursesByCategory,
} from "@/server/repositories/catalog";
import { listEnrollmentsForUser } from "@/server/repositories/learning";
import { getLatestSubscriptionForUser } from "@/server/repositories/payments";

export default async function TableauDeBordPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }

  const name =
    session.profile?.firstName ??
    session.profile?.displayName ??
    session.user.email ??
    "apprenant";

  const [hasPremium, subscription, enrollments, categories, courseCountByCategory] =
    await Promise.all([
      canAccessPremiumContent(session.user.id),
      getLatestSubscriptionForUser(session.user.id),
      listEnrollmentsForUser(session.user.id),
      listCategories(),
      countPublishedCoursesByCategory(),
    ]);

  // Associe chaque inscription à sa formation (titre, image, catégorie).
  const pairs = (
    await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await getCourseById(enrollment.courseId);
        return course ? { enrollment, course } : null;
      }),
    )
  ).filter((p): p is NonNullable<typeof p> => p !== null);

  const hasCourses = pairs.length > 0;

  // Hero = formation la plus récemment active et non terminée (sinon la 1re).
  const hero =
    pairs.find((p) => p.enrollment.status !== "completed") ?? pairs[0] ?? null;

  let heroResumeHref = hero ? `/app/formations/${hero.course.slug}` : "/app/catalogue";
  if (hero?.enrollment.lastLessonId) {
    const lessonPath = await getLessonAppPath(hero.enrollment.lastLessonId);
    if (lessonPath) heroResumeHref = lessonPath;
  }

  const rest = hero ? pairs.filter((p) => p.enrollment.id !== hero.enrollment.id) : [];

  const expiresLabel = subscription?.endsAt
    ? new Date(subscription.endsAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <section className="space-y-6">
      {/* En-tête épuré : salutation + statut abonnement en une ligne. */}
      <div className="ui-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">
            Bonjour, {name}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {hasPremium
              ? hasCourses
                ? "Reprenez votre formation là où vous vous êtes arrêté."
                : "Votre accès est actif. Choisissez une formation pour commencer."
              : "Activez l’accès pour regarder les leçons premium et suivre votre progression."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-soft bg-canvas px-3 py-2 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${hasPremium ? "bg-progress-500" : "bg-ink-muted/40"}`}
            aria-hidden
          />
          <span className="font-semibold text-ink">
            {hasPremium ? "Accès actif" : subscription?.status ?? "Accès inactif"}
          </span>
          {hasPremium && expiresLabel ? (
            <span className="text-ink-muted">· jusqu’au {expiresLabel}</span>
          ) : null}
        </div>
      </div>

      {/* Bannière abonnement (uniquement si pas d’accès). */}
      {!hasPremium ? (
        <div className="ui-card flex flex-col gap-3 border-action-200 bg-action-50/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-soft bg-action-500 text-white">
              <Lock className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
            <p className="text-sm text-ink-muted">
              <span className="font-semibold text-ink">2 000 FCFA / 30 jours</span> pour
              débloquer toutes les leçons et suivre votre progression.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/paiement"
              className="inline-flex h-10 items-center gap-2 rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <CreditCard className="h-4 w-4" strokeWidth={2} aria-hidden />
              S&apos;abonner
            </Link>
            <Link
              href="/paiement/manuel"
              className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-white"
            >
              WhatsApp / Mobile Money
            </Link>
          </div>
        </div>
      ) : null}

      {hasCourses && hero ? (
        <>
          <ContinueLearningHero
            title={hero.course.title}
            categoryName={hero.course.category?.name}
            thumbnailUrl={hero.course.thumbnailUrl}
            progressPercent={hero.enrollment.progressPercent}
            resumeHref={heroResumeHref}
            courseHref={`/app/formations/${hero.course.slug}`}
            isCompleted={hero.enrollment.status === "completed"}
          />

          {rest.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-ink sm:text-xl">
                  Vos formations en cours
                </h2>
                <Link
                  href="/app/mes-formations"
                  className="text-sm font-semibold text-brand-600 hover:underline"
                >
                  Tout voir
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map(({ enrollment, course }) => (
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
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Link
              href="/app/catalogue"
              className="inline-flex h-10 items-center gap-2 rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
              Explorer d&apos;autres catégories
            </Link>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink sm:text-xl">
                Commencez par une catégorie
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Choisissez un domaine, ouvrez une formation, puis lancez la première leçon.
              </p>
            </div>
            <Link
              href="/app/catalogue"
              className="hidden text-sm font-semibold text-brand-600 hover:underline sm:inline"
            >
              Tout voir
            </Link>
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
          ) : (
            <p className="ui-card p-5 text-sm text-ink-muted">
              Les catégories seront bientôt disponibles.{" "}
              <Link href="/app/catalogue" className="font-semibold text-brand-600 underline">
                Voir le catalogue
              </Link>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
