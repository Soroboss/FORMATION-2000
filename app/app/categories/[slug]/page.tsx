import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CreditCard } from "lucide-react";
import { CourseCard } from "@/components/learning/course-card";
import { getSession } from "@/lib/auth/session";
import { resolveCategoryIcon } from "@/lib/learning/category-icons";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";
import { getCategoryBySlug, listCourses } from "@/server/repositories/catalog";

export default async function AppCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const session = await getSession();
  const [courses, hasPremium] = await Promise.all([
    listCourses({ categorySlug: slug }),
    canAccessPremiumContent(session?.user.id),
  ]);
  const Icon = resolveCategoryIcon(category.icon ?? category.slug);

  return (
    <section className="space-y-6">
      <div className="ui-card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-soft bg-brand-50 text-brand-600">
            <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold text-ink">{category.name}</h1>
            {category.description ? (
              <p className="mt-1 text-sm text-ink-muted">{category.description}</p>
            ) : null}
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
              <BookOpen className="h-3.5 w-3.5 text-brand-600" strokeWidth={2} aria-hidden />
              {courses.length} formation{courses.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {!hasPremium ? (
          <div className="mt-5 rounded-soft border border-action-200 bg-action-50 p-4">
            <p className="text-sm text-ink-muted">
              Choisissez une formation ci-dessous. Pour regarder les leçons premium et
              l&apos;installer dans Mes formations, activez l&apos;accès mensuel.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href="/paiement"
                className="inline-flex h-10 items-center gap-2 rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <CreditCard className="h-4 w-4" strokeWidth={2} aria-hidden />
                S&apos;abonner — 2 000 FCFA
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

        <p className="mt-4 text-xs text-ink-muted">
          <Link href="/app/catalogue" className="font-semibold text-brand-600 hover:underline">
            ← Toutes les catégories
          </Link>
        </p>
      </div>

      {courses.length === 0 ? (
        <p className="ui-card border-dashed p-6 text-sm text-ink-muted">
          Aucune formation dans cette catégorie.{" "}
          <Link href="/app/catalogue" className="font-semibold text-brand-600 underline">
            Retour au catalogue
          </Link>
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} hrefBase="/app/formations" />
          ))}
        </div>
      )}
    </section>
  );
}
