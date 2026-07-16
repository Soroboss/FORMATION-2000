import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass, TrendingUp } from "lucide-react";
import { CoverImage } from "@/components/media/cover-image";
import { PageHeader, StatCard } from "@/components/app/page-header";
import { coverImageAlt } from "@/lib/media/cover-image";
import { getSession } from "@/lib/auth/session";
import { getCourseById } from "@/server/repositories/catalog";
import { listEnrollmentsForUser } from "@/server/repositories/learning";

export default async function ProgressionPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }

  const enrollments = await listEnrollmentsForUser(session.user.id);
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
  const global =
    total === 0
      ? 0
      : Math.round(pairs.reduce((acc, p) => acc + p.enrollment.progressPercent, 0) / total);

  return (
    <section className="space-y-6">
      <PageHeader
        icon={TrendingUp}
        title="Progression"
        subtitle="Vue d’ensemble de votre avancement pédagogique."
        tone="progress"
      />

      {total === 0 ? (
        <div className="ui-card border-dashed p-6 text-center sm:p-8">
          <p className="font-display font-semibold text-ink">Pas encore de progression</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Explorez une catégorie, activez l’accès si besoin, puis commencez une leçon.
          </p>
          <Link
            href="/app/catalogue"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
            Voir le catalogue
          </Link>
        </div>
      ) : (
        <>
          {/* Hero progression globale. */}
          <div className="ui-card overflow-hidden">
            <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
              <div
                className="relative mx-auto h-28 w-28 shrink-0 rounded-full sm:mx-0"
                style={{
                  background: `conic-gradient(var(--progress) ${global * 3.6}deg, var(--border) 0deg)`,
                }}
                aria-hidden
              >
                <div className="absolute inset-[10px] flex items-center justify-center rounded-full bg-canvas-card">
                  <span className="font-display text-2xl font-bold text-ink">{global}%</span>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Global" value={`${global}%`} tone="progress" hint="progression moyenne" />
                <StatCard label="Commencées" value={total} hint="formations actives" />
                <StatCard label="Terminées" value={completed} tone="action" hint="100 % atteint" />
              </div>
            </div>
          </div>

          {/* Détail par formation. */}
          <ul className="space-y-3">
            {pairs.map(({ enrollment, course }) => {
              const percent = Math.min(100, Math.max(0, Math.round(enrollment.progressPercent)));
              const done = enrollment.status === "completed";
              return (
                <li key={enrollment.id} className="ui-card p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-soft">
                      {course.thumbnailUrl ? (
                        <CoverImage
                          src={course.thumbnailUrl}
                          alt={coverImageAlt(course.title, "course")}
                          variant="fill"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-brand-600 to-action-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          {course.category?.name ? (
                            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                              {course.category.name}
                            </p>
                          ) : null}
                          <p className="truncate font-semibold text-ink">{course.title}</p>
                        </div>
                        <span
                          className={`shrink-0 text-sm font-bold ${done ? "text-action-600" : "text-progress-600"}`}
                        >
                          {percent}%
                        </span>
                      </div>
                      <div className="progress-bar mt-2">
                        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                      </div>
                      <Link
                        href={`/app/formations/${course.slug}`}
                        className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline"
                      >
                        {done ? "Revoir la formation" : "Continuer"}
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
