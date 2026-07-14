import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard, Lock, MessageCircle } from "lucide-react";
import { CourseCurriculum } from "@/components/learning/course-curriculum";
import { getSession } from "@/lib/auth/session";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";
import { getCourseBySlug } from "@/server/repositories/catalog";

export default async function AppFormationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const session = await getSession();
  const hasPremium = await canAccessPremiumContent(session?.user.id);
  const locked = course.accessType !== "free" && !hasPremium;

  const firstOpen = course.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.isPreview || !locked || course.accessType === "free");

  return (
    <section className="space-y-6">
      <div className="ui-card p-6 sm:p-8">
        <p className="text-sm font-semibold text-brand-600">{course.category?.name}</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">{course.title}</h1>
        {course.shortDescription ? (
          <p className="mt-2 text-sm text-ink-muted">{course.shortDescription}</p>
        ) : null}

        {locked ? (
          <div className="mt-5 rounded-soft border border-action-200 bg-action-50 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-soft bg-action-500 text-white">
                <Lock className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
              <div>
                <p className="font-display font-semibold text-ink">Formation premium</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Pour regarder toutes les leçons et installer cette formation dans{" "}
                  <strong className="text-ink">Mes formations</strong>, activez l&apos;accès
                  mensuel (2&nbsp;000&nbsp;FCFA / 30 jours). Les aperçus gratuits restent ouverts.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/paiement"
                    className="inline-flex h-10 items-center gap-2 rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    <CreditCard className="h-4 w-4" strokeWidth={2} aria-hidden />
                    Payer maintenant
                  </Link>
                  <Link
                    href="/paiement/manuel"
                    className="inline-flex h-10 items-center gap-2 rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-white"
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
                    Mobile Money + WhatsApp
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-progress-700">
            Accès débloqué. Commencez une leçon pour l&apos;ajouter à Mes formations.
          </p>
        )}

        {firstOpen ? (
          <Link
            href={`/app/formations/${course.slug}/lecons/${firstOpen.id}`}
            className="mt-5 inline-flex h-11 items-center rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {firstOpen.isPreview && locked ? "Voir l'aperçu gratuit" : "Commencer"}
          </Link>
        ) : null}

        <p className="mt-4 text-xs text-ink-muted">
          <Link href="/app/catalogue" className="font-semibold text-brand-600 hover:underline">
            ← Retour au catalogue
          </Link>
          {course.category ? (
            <>
              {" · "}
              <Link
                href={`/app/categories/${course.category.slug}`}
                className="font-semibold text-brand-600 hover:underline"
              >
                {course.category.name}
              </Link>
            </>
          ) : null}
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold text-ink">Parcours</h2>
        <div className="mt-4">
          <CourseCurriculum course={course} hrefBase="/app/formations" locked={locked} />
        </div>
      </div>
    </section>
  );
}
