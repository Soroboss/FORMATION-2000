import Link from "next/link";
import { listAdminCourses } from "@/server/repositories/admin-catalog";
import { deleteCourseAction, publishCourseAction } from "@/server/actions/admin-catalog";
import { Button } from "@/components/ui/button";
import { AdminEmptyState, AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { BulkCreateFormationsForm } from "@/components/admin/bulk-create-formations-form";
import { accessTypeLabel, courseStatusLabel } from "@/lib/admin/labels";

export default async function AdminFormationsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const { created } = await searchParams;
  const courses = await listAdminCourses();
  const createdCount = created ? Number(created) : 0;

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Formations"
        description="Ajoutez plusieurs formations d’un coup, puis gérez-les ici."
        actions={
          <Link
            href="/admin/formations/nouvelle"
            className="inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Ajouter des formations
          </Link>
        }
      />

      {createdCount > 0 ? (
        <p className="rounded-soft border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {createdCount} formation{createdCount > 1 ? "s" : ""} créée
          {createdCount > 1 ? "s" : ""} — visibles pour les abonnés payants si publiées.
        </p>
      ) : null}

      <BulkCreateFormationsForm compact />

      {courses.length === 0 ? (
        <AdminEmptyState
          title="Aucune formation pour l’instant"
          description="Utilisez le formulaire ci-dessus : titre + lien YouTube, puis Créer."
        />
      ) : (
        <div className="ui-card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-canvas-border bg-canvas/60 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Accès</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-canvas-border last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/formations/${course.id}`}
                      className="font-semibold text-brand-700 hover:underline"
                    >
                      {course.title}
                    </Link>
                    <p className="text-xs text-ink-muted">{course.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      value={course.status}
                      label={courseStatusLabel(course.status)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      value={course.accessType}
                      label={accessTypeLabel(course.accessType)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/formations/${course.id}`}
                        className="inline-flex h-9 items-center rounded-brand bg-brand-600 px-3 text-xs font-semibold text-white hover:bg-brand-700"
                      >
                        Modifier
                      </Link>
                      {course.status === "published" ? (
                        <Link
                          href={`/app/formations/${course.slug}`}
                          className="inline-flex h-9 items-center rounded-brand border border-canvas-border px-3 text-xs font-semibold text-ink hover:bg-canvas"
                        >
                          Voir
                        </Link>
                      ) : null}
                      {course.status !== "published" ? (
                        <form action={publishCourseAction}>
                          <input type="hidden" name="id" value={course.id} />
                          <Button type="submit" size="sm" variant="secondary">
                            Publier
                          </Button>
                        </form>
                      ) : null}
                      <form action={deleteCourseAction}>
                        <input type="hidden" name="id" value={course.id} />
                        <Button type="submit" size="sm" variant="outline">
                          Supprimer
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
