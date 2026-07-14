import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getCourseById } from "@/server/repositories/catalog";
import { listEnrollmentsForUser } from "@/server/repositories/learning";

export default async function ProgressionPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }

  const enrollments = await listEnrollmentsForUser(session.user.id);
  const global =
    enrollments.length === 0
      ? 0
      : Math.round(
          (enrollments.reduce((acc, e) => acc + e.progressPercent, 0) / enrollments.length) *
            100,
        ) / 100;

  return (
    <section className="space-y-6">
      <div className="ui-card p-5 sm:p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Progression</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Vue d&apos;ensemble de votre avancement pédagogique.
        </p>
      </div>

      <div className="ui-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          Progression globale
        </p>
        <p className="mt-2 font-display text-4xl font-bold text-ink">{global}%</p>
        <p className="mt-1 text-sm text-ink-muted">
          Moyenne sur {enrollments.length} formation
          {enrollments.length > 1 ? "s" : ""} commencée
          {enrollments.length > 1 ? "s" : ""}.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="ui-card border-dashed p-6 text-center">
          <p className="font-display font-semibold text-ink">Pas encore de progression</p>
          <p className="mt-2 text-sm text-ink-muted">
            Explorez une catégorie, payez si besoin, puis commencez une leçon.
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
        <ul className="space-y-3">
          {await Promise.all(
            enrollments.map(async (enrollment) => {
              const course = await getCourseById(enrollment.courseId);
              return (
                <li key={enrollment.id} className="ui-card p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-ink">
                      {course?.title ?? enrollment.courseId}
                    </span>
                    <span className="font-semibold text-progress-600">
                      {enrollment.progressPercent}%
                    </span>
                  </div>
                  <div className="progress-bar mt-3">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, Math.max(0, enrollment.progressPercent))}%`,
                      }}
                    />
                  </div>
                  {course ? (
                    <Link
                      href={`/app/formations/${course.slug}`}
                      className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline"
                    >
                      Continuer
                    </Link>
                  ) : null}
                </li>
              );
            }),
          )}
        </ul>
      )}
    </section>
  );
}
