import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/write";
import { courseUpsertSchema } from "@/lib/validation/admin";
import { listAdminCategories, upsertCourse } from "@/server/repositories/admin-catalog";
import type { CourseStatus } from "@/types/catalog";
import { Button } from "@/components/ui/button";

export default async function NouvelleFormationPage() {
  const categories = await listAdminCategories();

  async function createAction(formData: FormData) {
    "use server";
    const session = await requireAdminSession();
    const parsed = courseUpsertSchema.safeParse({
      title: String(formData.get("title") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim() || undefined,
      shortDescription: String(formData.get("shortDescription") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      categoryId: String(formData.get("categoryId") ?? "").trim() || undefined,
      level: String(formData.get("level") ?? "").trim() || undefined,
      accessType: String(formData.get("accessType") ?? "subscription"),
      estimatedDurationMinutes: String(formData.get("estimatedDurationMinutes") ?? "0"),
      isFeatured:
        formData.get("isFeatured") === "on" || formData.get("isFeatured") === "true",
      status: String(formData.get("status") ?? "draft"),
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
    }
    const course = await upsertCourse({
      title: parsed.data.title,
      slug: parsed.data.slug,
      shortDescription: parsed.data.shortDescription,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId || undefined,
      level: parsed.data.level || undefined,
      accessType: parsed.data.accessType,
      estimatedDurationMinutes: parsed.data.estimatedDurationMinutes,
      isFeatured: parsed.data.isFeatured,
      status: parsed.data.status as CourseStatus,
      authorUserId: session.user.id,
    });
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "course.create",
      entityType: "course",
      entityId: course.id,
    });
    revalidatePath("/admin/formations");
    redirect(`/admin/formations/${course.id}`);
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/admin/formations" className="text-sm text-brand-700 hover:underline">
          ← Formations
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900">
          Nouvelle formation
        </h1>
      </div>
      <form action={createAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Titre</span>
          <input name="title" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Slug (optionnel)</span>
          <input name="slug" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Résumé</span>
          <textarea name="shortDescription" rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Description</span>
          <textarea name="description" rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Catégorie</span>
          <select name="categoryId" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Niveau</span>
            <select name="level" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="">—</option>
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Accès</span>
            <select name="accessType" defaultValue="subscription" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="free">Gratuit</option>
              <option value="subscription">Abonnement</option>
              <option value="purchase">Achat</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Statut</span>
          <select name="status" defaultValue="draft" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="draft">Brouillon</option>
            <option value="in_review">En revue</option>
            <option value="published">Publié</option>
            <option value="archived">Archivé</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" />
          Mise en avant
        </label>
        <Button type="submit">Créer</Button>
      </form>
    </section>
  );
}
