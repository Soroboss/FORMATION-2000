import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseCurriculum } from "@/components/learning/course-curriculum";
import { getCourseBySlug } from "@/server/repositories/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Formation introuvable" };
  return {
    title: course.title,
    description: course.shortDescription ?? undefined,
  };
}

export default async function FormationPublicPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const firstPreview = course.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.isPreview);

  return (
    <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          {course.category ? (
            <Link
              href={`/categories/${course.category.slug}`}
              className="text-sm font-semibold text-brand-700 hover:underline"
            >
              {course.category.name}
            </Link>
          ) : null}
          <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
            {course.title}
          </h1>
          {course.shortDescription ? (
            <p className="mt-3 text-lg text-slate-600">{course.shortDescription}</p>
          ) : null}

          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            <Meta label="Niveau" value={course.level ?? "—"} />
            <Meta label="Durée" value={`${course.estimatedDurationMinutes} min`} />
            <Meta label="Leçons" value={String(course.lessonCount)} />
          </dl>

          {course.description ? (
            <p className="mt-6 text-slate-700 leading-relaxed">{course.description}</p>
          ) : null}

          <List title="Objectifs" items={course.learningOutcomes} />
          <List title="Prérequis" items={course.prerequisites} />
          <List title="Outils nécessaires" items={course.requiredTools} />

          {course.finalProjectDescription ? (
            <section className="mt-6">
              <h2 className="font-semibold text-slate-900">Projet final</h2>
              <p className="mt-2 text-sm text-slate-700">{course.finalProjectDescription}</p>
            </section>
          ) : null}
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-action-700">
            Accès
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900">
            2&nbsp;000 <span className="text-base font-semibold">FCFA</span>
          </p>
          <p className="mt-1 text-sm text-slate-600">30 jours · toutes les formations incluses</p>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/inscription"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              S&apos;abonner
            </Link>
            {firstPreview ? (
              <Link
                href={`/app/formations/${course.slug}/lecons/${firstPreview.id}`}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-brand-200 bg-white px-4 text-sm font-semibold text-brand-900 hover:bg-brand-50"
              >
                Voir l&apos;aperçu gratuit
              </Link>
            ) : null}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Les leçons premium restent verrouillées sans abonnement actif. Les créateurs de
            contenu sont crédités sur chaque leçon.
          </p>
        </aside>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-slate-900">Sommaire</h2>
        <p className="mt-2 text-sm text-slate-600">
          Aperçu du parcours. Connectez-vous pour ouvrir les leçons en aperçu ou via abonnement.
        </p>
        <div className="mt-6">
          <CourseCurriculum course={course} hrefBase="/app/formations" locked />
        </div>
      </section>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-brand-50 px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-brand-700">{label}</dt>
      <dd className="mt-1 text-sm font-medium capitalize text-slate-900">{value}</dd>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
