import Link from "next/link";
import { Clock, PlayCircle } from "lucide-react";
import type { CourseListItem } from "@/types/catalog";
import { LevelBadge } from "@/components/brand/level-badge";
import { cn } from "@/lib/utils";

export function CourseCard({
  course,
  hrefBase = "/formations",
  progressPercent,
  className,
}: {
  course: CourseListItem;
  hrefBase?: string;
  /** Si fourni, affiche barre de progression + CTA Continuer */
  progressPercent?: number;
  className?: string;
}) {
  const href = `${hrefBase}/${course.slug}`;
  const hasProgress = typeof progressPercent === "number";

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-card border border-canvas-border bg-canvas-card shadow-card transition duration-200 ease-brand hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <Link href={href} className="block">
        <div
          className="aspect-[16/9] bg-gradient-to-br from-brand-600 via-brand-500 to-action-500 bg-cover bg-center"
          style={
            course.thumbnailUrl
              ? { backgroundImage: `url(${course.thumbnailUrl})` }
              : undefined
          }
          role="img"
          aria-label={course.title}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          {course.level ? <LevelBadge level={course.level} /> : null}
          {course.accessType === "free" ? (
            <span className="rounded-full bg-progress-50 px-2.5 py-1 text-progress-700">
              Gratuit
            </span>
          ) : (
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-700">
              Abonnement
            </span>
          )}
          {course.isFeatured ? (
            <span className="rounded-full bg-action-50 px-2.5 py-1 text-action-700">
              Nouveau
            </span>
          ) : null}
        </div>
        <h3 className="font-display text-lg font-semibold text-ink">
          <Link href={href} className="hover:text-brand-600">
            {course.title}
          </Link>
        </h3>
        {course.shortDescription ? (
          <p className="line-clamp-2 text-sm text-ink-muted">{course.shortDescription}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs font-medium text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <PlayCircle className="h-3.5 w-3.5 text-brand-600" strokeWidth={2} aria-hidden />
            {course.lessonCount} leçon{course.lessonCount > 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-brand-600" strokeWidth={2} aria-hidden />
            {course.estimatedDurationMinutes} min
          </span>
        </div>

        {hasProgress ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-ink-muted">Progression</span>
              <span className="font-semibold text-progress-600">{progressPercent}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
            <Link
              href={href}
              className="inline-flex h-10 w-full items-center justify-center rounded-brand bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Continuer
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
