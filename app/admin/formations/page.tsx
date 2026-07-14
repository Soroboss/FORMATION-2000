import Link from "next/link";
import { listAdminCourses } from "@/server/repositories/admin-catalog";
import { deleteCourseAction, publishCourseAction } from "@/server/actions/admin-catalog";
import { Button } from "@/components/ui/button";

export default async function AdminFormationsPage() {
  const courses = await listAdminCourses();

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Formations</h1>
          <p className="mt-1 text-sm text-slate-600">CRUD catalogue (brouillon → publication).</p>
        </div>
        <Link
          href="/admin/formations/nouvelle"
          className="inline-flex h-10 items-center rounded-lg bg-action-600 px-4 text-sm font-semibold text-white hover:bg-action-700"
        >
          Nouvelle formation
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          Aucune formation.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Accès</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/formations/${course.id}`}
                      className="font-medium text-brand-800 hover:underline"
                    >
                      {course.title}
                    </Link>
                    <p className="text-xs text-slate-500">{course.slug}</p>
                  </td>
                  <td className="px-4 py-3">{course.status}</td>
                  <td className="px-4 py-3">{course.accessType}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
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
