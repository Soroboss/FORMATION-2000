import Link from "next/link";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { CoverImage } from "@/components/media/cover-image";
import { coverImageAlt } from "@/lib/media/cover-image";
import { cn } from "@/lib/utils";

type ContinueHeroProps = {
  title: string;
  categoryName?: string | null;
  thumbnailUrl: string | null;
  progressPercent: number;
  /** Lien direct vers la leçon à reprendre (sinon la page formation). */
  resumeHref: string;
  courseHref: string;
  isCompleted?: boolean;
};

/** Carte principale : l’action évidente = reprendre là où on s’est arrêté. */
export function ContinueLearningHero({
  title,
  categoryName,
  thumbnailUrl,
  progressPercent,
  resumeHref,
  courseHref,
  isCompleted = false,
}: ContinueHeroProps) {
  const percent = Math.min(100, Math.max(0, Math.round(progressPercent)));
  return (
    <div className="ui-card overflow-hidden">
      <div className="grid gap-0 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="relative min-h-[9rem] sm:min-h-full">
          {thumbnailUrl ? (
            <CoverImage
              src={thumbnailUrl}
              alt={coverImageAlt(title, "course")}
              variant="fill"
              overlay="bottom"
              priority
            />
          ) : (
            <div className="h-full min-h-[9rem] w-full bg-gradient-to-br from-brand-700 via-brand-600 to-action-600" />
          )}
        </div>

        <div className="flex flex-col justify-center gap-3 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {isCompleted ? "Formation terminée" : "Reprendre l’apprentissage"}
            {categoryName ? <span className="text-ink-muted"> · {categoryName}</span> : null}
          </p>
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">{title}</h2>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
              <span>Progression</span>
              <span className="font-semibold text-progress-600">{percent}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>

          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <Link
              href={resumeHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4" strokeWidth={2} aria-hidden />
              ) : (
                <PlayCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
              )}
              {isCompleted ? "Revoir la formation" : percent > 0 ? "Reprendre" : "Commencer"}
            </Link>
            <Link
              href={courseHref}
              className="inline-flex h-11 items-center justify-center rounded-brand border-2 border-brand-600 px-5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              Voir le parcours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

type ProgressCardProps = {
  title: string;
  categoryName?: string | null;
  thumbnailUrl: string | null;
  progressPercent: number;
  href: string;
  isCompleted?: boolean;
  className?: string;
};

/** Carte compacte pour la grille « Vos formations en cours ». */
export function EnrollmentProgressCard({
  title,
  categoryName,
  thumbnailUrl,
  progressPercent,
  href,
  isCompleted = false,
  className,
}: ProgressCardProps) {
  const percent = Math.min(100, Math.max(0, Math.round(progressPercent)));
  return (
    <Link
      href={href}
      className={cn(
        "ui-card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <div className="relative h-28 w-full">
        {thumbnailUrl ? (
          <CoverImage
            src={thumbnailUrl}
            alt={coverImageAlt(title, "course")}
            variant="fill"
            overlay="bottom"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-600 via-brand-500 to-action-500" />
        )}
        {isCompleted ? (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-progress-600 px-2 py-0.5 text-[11px] font-semibold text-white">
            <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            Terminé
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {categoryName ? (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            {categoryName}
          </p>
        ) : null}
        <h3 className="line-clamp-2 font-semibold text-ink group-hover:text-brand-700">
          {title}
        </h3>
        <div className="mt-auto space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-ink-muted">
            <span>{percent}%</span>
            <span className="font-semibold text-brand-600">
              {isCompleted ? "Revoir" : percent > 0 ? "Reprendre" : "Commencer"}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
