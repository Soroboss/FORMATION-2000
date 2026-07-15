import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import type { Category } from "@/types/catalog";
import { CoverImage } from "@/components/media/cover-image";
import { coverImageAlt } from "@/lib/media/cover-image";
import { resolveCategoryEmoji, resolveCategoryIcon } from "@/lib/learning/category-icons";
import { cn } from "@/lib/utils";

type CategoryHeroProps = {
  category: Category;
  courseCount: number;
  backHref: string;
  backLabel: string;
  variant?: "public" | "app";
  /** Boutons CTA (public). Style automatique si `showDefaultActions`. */
  actions?: ReactNode;
  showDefaultActions?: boolean;
  footer?: ReactNode;
};

export function CategoryHero({
  category,
  courseCount,
  backHref,
  backLabel,
  variant = "public",
  actions,
  showDefaultActions = false,
  footer,
}: CategoryHeroProps) {
  const Icon = resolveCategoryIcon(category.icon ?? category.slug);
  const emoji = resolveCategoryEmoji(category.slug);
  const hasImage = Boolean(category.imageUrl);
  const countLabel = `${courseCount} formation${courseCount > 1 ? "s" : ""}`;

  const defaultPublicActions = (
    <>
      <Link
        href="/inscription"
        className="inline-flex h-11 items-center justify-center rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Accéder pour 2 000 FCFA
      </Link>
      <Link
        href="/tarifs"
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-brand px-5 text-sm font-semibold",
          hasImage
            ? "border-2 border-white/80 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            : "border-2 border-brand-600 text-brand-600 hover:bg-brand-50",
        )}
      >
        Voir l&apos;offre
      </Link>
    </>
  );

  const resolvedActions = actions ?? (showDefaultActions ? defaultPublicActions : null);

  if (variant === "app") {
    return (
      <div className="ui-card overflow-hidden">
        {hasImage ? (
          <CoverImage
            src={category.imageUrl!}
            alt={coverImageAlt(category.name, "category")}
            variant="banner"
            overlay="bottom"
            priority
          />
        ) : null}
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-soft bg-brand-50 text-brand-600">
              {emoji ?? <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                Catégorie
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold text-ink">{category.name}</h1>
              {category.description ? (
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{category.description}</p>
              ) : null}
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                <BookOpen className="h-3.5 w-3.5 text-brand-600" strokeWidth={2} aria-hidden />
                {countLabel}
              </p>
            </div>
          </div>
          {actions ? <div className="mt-5">{actions}</div> : null}
          {footer ? <div className="mt-4">{footer}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-canvas-border",
        hasImage ? "bg-brand-950 text-white" : "bg-white text-ink",
      )}
    >
      {hasImage ? (
        <div className="absolute inset-0" aria-hidden>
          <CoverImage
            src={category.imageUrl!}
            alt=""
            variant="banner"
            overlay="hero"
            priority
            className="h-full min-h-full"
            imageClassName="opacity-90"
          />
        </div>
      ) : null}

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href={backHref}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-semibold hover:underline",
            hasImage ? "text-white/90 hover:text-white" : "text-brand-600",
          )}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          {backLabel}
        </Link>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-5 sm:flex-row sm:items-start">
            <span
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-card text-2xl",
                hasImage ? "bg-white/15 text-white backdrop-blur-sm" : "bg-brand-50 text-brand-600",
              )}
            >
              {emoji ?? <Icon className="h-7 w-7" strokeWidth={2} aria-hidden />}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm font-semibold uppercase tracking-wide",
                  hasImage ? "text-white/80" : "text-brand-600",
                )}
              >
                Catégorie
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {category.name}
              </h1>
              {category.description ? (
                <p
                  className={cn(
                    "mt-3 max-w-2xl text-base leading-relaxed sm:text-lg",
                    hasImage ? "text-white/85" : "text-ink-muted",
                  )}
                >
                  {category.description}
                </p>
              ) : null}
              <p
                className={cn(
                  "mt-4 inline-flex items-center gap-2 text-sm font-medium",
                  hasImage ? "text-white/80" : "text-ink-muted",
                )}
              >
                <BookOpen className="h-4 w-4" strokeWidth={2} aria-hidden />
                {countLabel} disponible{courseCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {resolvedActions ? (
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">{resolvedActions}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
