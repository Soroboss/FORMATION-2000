import Link from "next/link";
import type { Category } from "@/types/catalog";
import { CoverImage } from "@/components/media/cover-image";
import { coverImageAlt } from "@/lib/media/cover-image";
import { resolveCategoryEmoji, resolveCategoryIcon } from "@/lib/learning/category-icons";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const ACCENTS = [
  { wrap: "bg-brand-50 text-brand-600 ring-brand-100", bar: "bg-brand-600" },
  { wrap: "bg-action-50 text-action-600 ring-action-100", bar: "bg-action-500" },
  { wrap: "bg-progress-50 text-progress-600 ring-progress-100", bar: "bg-progress-500" },
] as const;

export function CategoryCard({
  category,
  hrefBase = "/categories",
  courseCount,
  className,
  index = 0,
}: {
  category: Category;
  hrefBase?: string;
  courseCount?: number;
  className?: string;
  index?: number;
}) {
  const Icon = resolveCategoryIcon(category.icon ?? category.slug);
  const emoji = resolveCategoryEmoji(category.slug);
  const accent = ACCENTS[index % ACCENTS.length] ?? ACCENTS[0];
  const countLabel =
    typeof courseCount === "number"
      ? `${courseCount} formation${courseCount > 1 ? "s" : ""}`
      : null;

  return (
    <Link
      href={`${hrefBase}/${category.slug}`}
      className={cn(
        "ui-card group relative flex h-full flex-col overflow-hidden transition duration-200 ease-brand hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
        className,
      )}
    >
      <div className="relative">
        {category.imageUrl ? (
          <CoverImage
            src={category.imageUrl}
            alt={coverImageAlt(category.name, "category")}
            variant="card"
            overlay="bottom"
          />
        ) : (
          <div className="aspect-[16/9] bg-gradient-to-br from-brand-600 via-brand-500 to-action-500" />
        )}
        <span
          className={cn(
            "absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-soft text-lg shadow-md ring-2",
            accent.wrap,
          )}
          aria-hidden
        >
          {emoji ?? <Icon className="h-5 w-5" strokeWidth={2} />}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col p-5">
        <span className={cn("absolute inset-y-0 left-0 w-1", accent.bar)} aria-hidden />
        <div className="pl-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Catégorie</p>
          <h3 className="mt-1 font-display text-xl font-semibold text-ink group-hover:text-brand-700">
            {category.name}
          </h3>
          {category.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
              {category.description}
            </p>
          ) : null}
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-ink-muted">{countLabel ?? "Explorer"}</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
              Voir
              <ArrowRight
                className="h-4 w-4 transition group-hover:translate-x-0.5"
                strokeWidth={2}
                aria-hidden
              />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
