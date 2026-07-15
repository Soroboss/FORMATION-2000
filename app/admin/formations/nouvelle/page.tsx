import Link from "next/link";
import { BulkCreateFormationsForm } from "@/components/admin/bulk-create-formations-form";
import { listAdminCategories } from "@/server/repositories/admin-catalog";

export default async function NouvelleFormationPage() {
  const categories = await listAdminCategories();
  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/admin/formations" className="text-sm font-semibold text-brand-600 hover:underline">
          ← Formations
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">
          Ajouter des formations
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Remplissez plusieurs lignes d’un coup : titre + lien YouTube. Choisissez une catégorie pour
          que les formations apparaissent dans le catalogue filtré.
        </p>
      </div>
      <BulkCreateFormationsForm
        categories={activeCategories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </section>
  );
}
