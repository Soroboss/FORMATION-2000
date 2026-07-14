import Link from "next/link";
import type { Category } from "@/types/catalog";

export function CategoryCard({
  category,
  hrefBase = "/categories",
}: {
  category: Category;
  hrefBase?: string;
}) {
  return (
    <Link
      href={`${hrefBase}/${category.slug}`}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Catégorie</p>
      <h3 className="mt-2 font-display text-xl font-semibold text-slate-900">{category.name}</h3>
      {category.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{category.description}</p>
      ) : null}
    </Link>
  );
}
