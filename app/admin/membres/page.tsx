import Link from "next/link";
import { listMembers } from "@/server/repositories/admin-members";
import { AdminEmptyState, AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { memberStatusLabel, roleLabel } from "@/lib/admin/labels";

export default async function AdminMembresPage() {
  const members = await listMembers();

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Membres"
        description={`${members.length} profil(s) inscrit(s) sur Learnoon Academy.`}
      />

      {members.length === 0 ? (
        <AdminEmptyState
          title="Aucun membre"
          description="Les inscriptions apparaîtront ici."
        />
      ) : (
        <div className="ui-card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-canvas-border bg-canvas/60 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Membre</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Rôles</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-canvas-border last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/membres/${m.id}`}
                      className="font-semibold text-brand-700 hover:underline"
                    >
                      {m.displayName ?? m.email ?? m.id}
                    </Link>
                    <p className="text-xs text-ink-muted">{m.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={m.status} label={memberStatusLabel(m.status)} />
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {m.roles.map(roleLabel).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/membres/${m.id}`}
                      className="inline-flex h-9 items-center rounded-brand bg-brand-600 px-3 text-xs font-semibold text-white hover:bg-brand-700"
                    >
                      Gérer
                    </Link>
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
