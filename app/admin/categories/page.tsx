import { saveCategoryAction } from "@/server/actions/admin-catalog";
import { listAdminCategories } from "@/server/repositories/admin-catalog";
import { Button } from "@/components/ui/button";
import { AdminEmptyState, AdminPageHeader, StatusBadge } from "@/components/admin/ui";

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories();

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Catégories"
        description="Organisation du catalogue visible côté apprenant."
      />

      <form
        action={saveCategoryAction}
        className="ui-card grid gap-3 p-5 sm:grid-cols-2 sm:p-6"
      >
        <h2 className="font-display font-semibold text-ink sm:col-span-2">Ajouter une catégorie</h2>
        <input
          name="name"
          placeholder="Nom"
          required
          className="rounded-soft border border-canvas-border px-3 py-2 text-sm text-ink"
        />
        <input
          name="slug"
          placeholder="Slug (optionnel)"
          className="rounded-soft border border-canvas-border px-3 py-2 text-sm text-ink"
        />
        <input
          name="icon"
          placeholder="Icône (slug ou emoji)"
          className="rounded-soft border border-canvas-border px-3 py-2 text-sm text-ink"
        />
        <input
          name="sortOrder"
          type="number"
          defaultValue={categories.length + 1}
          className="rounded-soft border border-canvas-border px-3 py-2 text-sm text-ink"
        />
        <textarea
          name="description"
          placeholder="Description"
          rows={2}
          className="rounded-soft border border-canvas-border px-3 py-2 text-sm text-ink sm:col-span-2"
        />
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" name="isActive" defaultChecked />
          Active
        </label>
        <div className="flex justify-end">
          <Button type="submit" size="sm">
            Ajouter
          </Button>
        </div>
      </form>

      {categories.length === 0 ? (
        <AdminEmptyState
          title="Aucune catégorie"
          description="Ajoutez une catégorie pour classer les formations."
        />
      ) : (
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat.id} className="ui-card flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-semibold text-ink">{cat.name}</p>
                <p className="text-xs text-ink-muted">{cat.slug}</p>
              </div>
              <StatusBadge
                value={cat.isActive ? "active" : "suspended"}
                label={cat.isActive ? "Active" : "Inactive"}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
