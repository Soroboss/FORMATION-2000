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
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          Aucune formation commencée.{" "}
          <Link href="/app/catalogue" className="font-semibold text-brand-700 underline">
            Explorer le catalogue
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {courses.map(({ enrollment, course }) => (
            <li
              key={enrollment.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {course?.title ?? "Formation"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {enrollment.progressPercent}% · {enrollment.status}
                  </p>
                </div>
                {course ? (
                  <Link
                    href={`/app/formations/${course.slug}`}
                    className="text-sm font-semibold text-brand-700 hover:underline"
                  >
                    Continuer
                  </Link>
                ) : null}
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-progress-600"
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
