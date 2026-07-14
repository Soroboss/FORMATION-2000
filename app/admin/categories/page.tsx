import { saveCategoryAction } from "@/server/actions/admin-catalog";
import { listAdminCategories } from "@/server/repositories/admin-catalog";
import { Button } from "@/components/ui/button";

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Catégories</h1>
        <p className="mt-1 text-sm text-slate-600">Organisation du catalogue.</p>
      </div>

      <form action={saveCategoryAction} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <input name="name" placeholder="Nom" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="slug" placeholder="Slug (optionnel)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="icon" placeholder="Icône" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="sortOrder" type="number" defaultValue={categories.length + 1} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <textarea name="description" placeholder="Description" rows={2} className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked />
          Active
        </label>
        <Button type="submit" size="sm">
          Ajouter
        </Button>
      </form>

      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <span className="font-medium text-slate-900">{cat.name}</span>
            <span className="ml-2 text-xs text-slate-500">
              {cat.slug} · {cat.isActive ? "active" : "inactive"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
