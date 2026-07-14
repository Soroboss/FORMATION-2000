import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCourseById } from "@/server/repositories/catalog";
import { listEnrollmentsForUser } from "@/server/repositories/learning";

export default async function ProgressionPage() {
  const session = await getSession();
  if (!session) return null;

  const enrollments = await listEnrollmentsForUser(session.user.id);
  const global =
    enrollments.length === 0
      ? 0
      : Math.round(
          (enrollments.reduce((acc, e) => acc + e.progressPercent, 0) / enrollments.length) * 100,
        ) / 100;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Progression</h1>
        <p className="mt-1 text-sm text-slate-600">
          Vue d&apos;ensemble de votre avancement pédagogique.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          Progression globale
        </p>
        <p className="mt-2 font-display text-4xl font-bold text-slate-900">{global}%</p>
        <p className="mt-1 text-sm text-slate-600">
          Moyenne sur {enrollments.length} formation{enrollments.length > 1 ? "s" : ""} commencée
          {enrollments.length > 1 ? "s" : ""}.
        </p>
      </div>

      <ul className="space-y-3">
        {await Promise.all(
          enrollments.map(async (enrollment) => {
            const course = await getCourseById(enrollment.courseId);
            return (
              <li
                key={enrollment.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-900">
                    {course?.title ?? enrollment.courseId}
                  </span>
                  <span>{enrollment.progressPercent}%</span>
                </div>
                {course ? (
                  <Link
                    href={`/app/formations/${course.slug}`}
                    className="mt-2 inline-block text-xs font-semibold text-brand-700 hover:underline"
                  >
                    Ouvrir
                  </Link>
                ) : null}
              </li>
            );
          }),
        )}
      </ul>
    </section>
  );
}
