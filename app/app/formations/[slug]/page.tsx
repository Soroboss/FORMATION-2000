import Link from "next/link";
import { notFound } from "next/navigation";
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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-brand-700">{course.category?.name}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-slate-900">{course.title}</h1>
        {course.shortDescription ? (
          <p className="mt-2 text-sm text-slate-600">{course.shortDescription}</p>
        ) : null}

        {locked ? (
          <p className="mt-4 rounded-xl border border-action-200 bg-action-50 px-3 py-2 text-sm text-action-800">
            Contenu premium. Les aperçus gratuits restent ouverts. L&apos;abonnement sera activé en
            Phase 3.
          </p>
        ) : null}

        {firstOpen ? (
          <Link
            href={`/app/formations/${course.slug}/lecons/${firstOpen.id}`}
            className="mt-5 inline-flex h-11 items-center rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {firstOpen.isPreview ? "Commencer l'aperçu" : "Commencer"}
          </Link>
        ) : null}
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold text-slate-900">Parcours</h2>
        <div className="mt-4">
          <CourseCurriculum
            course={course}
            hrefBase="/app/formations"
            locked={locked}
          />
        </div>
      </div>
    </section>
  );
}
