import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard, Lock, MessageCircle } from "lucide-react";
import { CourseCurriculum } from "@/components/learning/course-curriculum";
import { getSession } from "@/lib/auth/session";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";
import { getCourseBySlug, getLessonAppPath } from "@/server/repositories/catalog";
import {
  getEnrollmentForCourse,
  listAssignmentsForCourse,
} from "@/server/repositories/learning";

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

  const [enrollment, assignments] = await Promise.all([
    session ? getEnrollmentForCourse(session.user.id, course.id) : Promise.resolve(null),
    listAssignmentsForCourse(course.id).catch(() => []),
  ]);

  const progressPercent = enrollment?.progressPercent ?? 0;
  const resumePath =
    enrollment?.lastLessonId != null
      ? await getLessonAppPath(enrollment.lastLessonId)
      : null;

  const firstOpen = course.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.isPreview || !locked || course.accessType === "free");

  const startHref =
    resumePath ??
    (firstOpen ? `/app/formations/${course.slug}/lecons/${firstOpen.id}` : null);

  return (
    <section className="space-y-6">
      <div className="ui-card overflow-hidden p-0">
        {course.thumbnailUrl ? (
          <div
            className="aspect-[21/9] bg-cover bg-center sm:aspect-[2.4/1]"
            style={{ backgroundImage: `url(${course.thumbnailUrl})` }}
            role="img"
            aria-label={course.title}
          />
        ) : null}
        <div className="p-6 sm:p-8">
          <p className="text-sm font-semibold text-brand-600">{course.category?.name}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">{course.title}</h1>
          {course.shortDescription ? (
            <p className="mt-2 text-sm text-ink-muted">{course.shortDescription}</p>
          ) : null}

          {enrollment ? (
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink-muted">Votre progression</span>
                <span className="font-semibold text-progress-600">{progressPercent}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>
            </div>
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

          {startHref ? (
            <Link
              href={startHref}
              className="mt-5 inline-flex h-11 items-center rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {resumePath
                ? "Reprendre"
                : firstOpen?.isPreview && locked
                  ? "Voir l'aperçu gratuit"
                  : "Commencer"}
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
      </div>

      {course.description ? (
        <div className="ui-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
            {course.description}
          </p>
        </div>
      ) : null}

      {course.learningOutcomes.length > 0 ? (
        <div className="ui-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Ce que vous allez apprendre
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-muted">
            {course.learningOutcomes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {course.finalProjectDescription || assignments.length > 0 ? (
        <div className="ui-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Exercices à faire</h2>
          {course.finalProjectDescription ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
              {course.finalProjectDescription}
            </p>
          ) : null}
          {assignments.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {assignments.map((a) => (
                <li key={a.id} className="rounded-soft border border-canvas-border p-3">
                  <p className="font-semibold text-ink">{a.title}</p>
                  {a.instructions ? (
                    <p className="mt-1 line-clamp-3 text-sm text-ink-muted">{a.instructions}</p>
                  ) : null}
                  {a.lessonId ? (
                    <Link
                      href={`/app/formations/${course.slug}/lecons/${a.lessonId}`}
                      className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:underline"
                    >
                      Ouvrir la leçon
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div>
        <h2 className="font-display text-xl font-bold text-ink">Parcours</h2>
        <div className="mt-4">
          <CourseCurriculum course={course} hrefBase="/app/formations" locked={locked} />
        </div>
      </div>
    </section>
  );
}
