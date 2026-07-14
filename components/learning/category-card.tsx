import Link from "next/link";
import type { Category } from "@/types/catalog";
import { resolveCategoryEmoji, resolveCategoryIcon } from "@/lib/learning/category-icons";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const ACCENTS = [
  { wrap: "bg-brand-50 text-brand-600", bar: "bg-brand-600" },
  { wrap: "bg-action-50 text-action-600", bar: "bg-action-500" },
  { wrap: "bg-progress-50 text-progress-600", bar: "bg-progress-500" },
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

  return (
    <Link
      href={`${hrefBase}/${category.slug}`}
      className={cn(
        "ui-card group relative block overflow-hidden p-5 transition duration-200 ease-brand hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md",
        className,
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", accent.bar)} aria-hidden />
      <div className="flex items-start gap-4 pl-1">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-soft text-lg",
            accent.wrap,
          )}
          aria-hidden
        >
          {emoji ?? <Icon className="h-5 w-5" strokeWidth={2} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Catégorie
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-ink group-hover:text-brand-700">
            {category.name}
          </h3>
          {category.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
              {category.description}
            </p>
          ) : null}
          <div className="mt-4 flex items-center justify-between gap-3">
            {typeof courseCount === "number" ? (
              <span className="text-xs font-medium text-ink-muted">
                {courseCount} formation{courseCount > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-xs font-medium text-brand-600">Explorer</span>
            )}
            <ArrowRight
              className="h-4 w-4 text-brand-600 transition group-hover:translate-x-0.5"
              strokeWidth={2}
              aria-hidden
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
