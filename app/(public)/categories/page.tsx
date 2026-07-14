import type { Metadata } from "next";
import { CategoryCard } from "@/components/learning/category-card";
import { listCategories } from "@/server/repositories/catalog";
import { hasInsForgePublicConfig } from "@/lib/insforge/server";

export const metadata: Metadata = {
  title: "Catégories",
  description: "Parcourez les catégories de formations Académie 2000.",
};

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-slate-900">Catégories</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Choisissez un domaine et explorez les parcours disponibles.
      </p>

      {!hasInsForgePublicConfig() ? (
        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Backend InsForge non configuré. Le catalogue apparaîtra après connexion et migrations.
        </p>
      ) : null}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
