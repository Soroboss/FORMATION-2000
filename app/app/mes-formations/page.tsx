import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCourseById } from "@/server/repositories/catalog";
import { listEnrollmentsForUser } from "@/server/repositories/learning";

export default async function MesFormationsPage() {
  const session = await getSession();
  if (!session) return null;

  const enrollments = await listEnrollmentsForUser(session.user.id);
  const courses = await Promise.all(
    enrollments.map(async (enrollment) => {
      const course = await getCourseById(enrollment.courseId);
      return { enrollment, course };
    }),
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Mes formations</h1>
        <p className="mt-1 text-sm text-slate-600">
          Formations commencées et progression associée.
        </p>
      </div>

      {courses.length === 0 ? (
        <p className="rounded-card border border-dashed border-canvas-border bg-canvas-card p-6 text-sm text-ink-muted">
          Aucune formation commencée.{" "}
          <Link href="/app/catalogue" className="font-semibold text-brand-600 underline">
            Explorer le catalogue
          </Link>
        </p>
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
