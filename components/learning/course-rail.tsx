import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CourseListItem } from "@/types/catalog";
import { CourseCard } from "@/components/learning/course-card";
import { cn } from "@/lib/utils";

type CourseRailProps = {
  title: string;
  subtitle?: string;
  courses: CourseListItem[];
  hrefBase?: string;
  /** Lien « Tout voir ». */
  viewAllHref?: string;
  viewAllLabel?: string;
  /** Icône/emoji décoratif avant le titre. */
  eyebrow?: string;
  className?: string;
};

/**
 * Rangée horizontale de formations (scroll-snap) — style catalogue vidéo.
 * Sur écran étroit : défilement horizontal ; le contenu reste accessible au clavier.
 */
export function CourseRail({
  title,
  subtitle,
  courses,
  hrefBase = "/formations",
  viewAllHref,
  viewAllLabel = "Tout voir",
  eyebrow,
  className,
}: CourseRailProps) {
  if (courses.length === 0) return null;

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-ink-muted">{subtitle}</p> : null}
        </div>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
          >
            {viewAllLabel}
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
        ) : null}
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:px-0">
        <ul className="flex snap-x snap-mandatory gap-4 sm:gap-6">
          {courses.map((course) => (
            <li
              key={course.id}
              className="w-[80vw] max-w-[300px] shrink-0 snap-start sm:w-[300px]"
            >
              <CourseCard course={course} hrefBase={hrefBase} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
