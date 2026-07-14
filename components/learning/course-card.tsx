import Link from "next/link";
import type { CourseListItem } from "@/types/catalog";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
};

export function CourseCard({
  course,
  hrefBase = "/formations",
}: {
  course: CourseListItem;
  hrefBase?: string;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-brand-200 hover:shadow-md">
      <Link href={`${hrefBase}/${course.slug}`} className="block">
        <div
          className="aspect-[16/9] bg-gradient-to-br from-brand-700 to-action-500 bg-cover bg-center"
          style={
            course.thumbnailUrl
              ? { backgroundImage: `url(${course.thumbnailUrl})` }
              : undefined
          }
          role="img"
          aria-label={course.title}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          {course.category ? (
            <span className="rounded-full bg-brand-50 px-2 py-1 text-brand-800">
              {course.category.name}
            </span>
          ) : null}
          {course.level ? (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
              {LEVEL_LABEL[course.level] ?? course.level}
            </span>
          ) : null}
          <span className="rounded-full bg-action-50 px-2 py-1 text-action-700">
            {course.accessType === "free" ? "Gratuit" : "Abonnement"}
          </span>
        </div>
        <h3 className="font-display text-lg font-semibold text-slate-900">
          <Link href={`${hrefBase}/${course.slug}`} className="hover:text-brand-800">
            {course.title}
          </Link>
        </h3>
        {course.shortDescription ? (
          <p className="line-clamp-2 text-sm text-slate-600">{course.shortDescription}</p>
        ) : null}
        <p className="mt-auto text-xs text-slate-500">
          {course.lessonCount} leçon{course.lessonCount > 1 ? "s" : ""} ·{" "}
          {course.estimatedDurationMinutes} min
        </p>
      </div>
    </article>
  );
}
