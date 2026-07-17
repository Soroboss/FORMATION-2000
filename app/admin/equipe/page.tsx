import Link from "next/link";
import {
  listStaffMembers,
  listRolePermissionMatrix,
} from "@/server/repositories/admin-members";
import { AdminEmptyState, AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { roleLabel } from "@/lib/admin/labels";
import { PERMISSION_DESCRIPTIONS } from "@/lib/permissions/roles";

export const dynamic = "force-dynamic";

export default async function AdminEquipePage() {
  const [staff, matrix] = await Promise.all([
    listStaffMembers(),
    listRolePermissionMatrix(),
  ]);

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Équipe & rôles"
        description="Collaborateurs ayant un accès administration et permissions par rôle."
      />

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">Collaborateurs</h2>
        {staff.length === 0 ? (
          <AdminEmptyState
            title="Aucun collaborateur"
            description="Attribuez un rôle staff à un membre depuis sa fiche pour l'ajouter à l'équipe."
          />
        ) : (
          <div className="ui-card overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-canvas-border bg-canvas/60 text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-4 py-3">Membre</th>
                  <th className="px-4 py-3">Rôles</th>
                  <th className="px-4 py-3 text-right">Gérer</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className="border-b border-canvas-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">
                        {member.displayName ?? member.email ?? "—"}
                      </p>
                      {member.email ? (
                        <p className="text-xs text-ink-muted">{member.email}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {member.roles.map((role) => (
                          <StatusBadge key={role} value={role} label={roleLabel(role)} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/membres/${member.id}`}
                        className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                      >
                        Ouvrir la fiche
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">Permissions par rôle</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {matrix.map((role) => (
            <div key={role.key} className="ui-card p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display font-bold text-ink">{role.name}</h3>
                <StatusBadge value={role.key} label={roleLabel(role.key)} />
              </div>
              {role.description ? (
                <p className="mt-1 text-sm text-ink-muted">{role.description}</p>
              ) : null}
              {role.permissions.length > 0 ? (
                <ul className="mt-3 space-y-1.5 text-sm">
                  {role.permissions.map((perm) => (
                    <li key={perm} className="flex items-start gap-2 text-ink-muted">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                      {PERMISSION_DESCRIPTIONS[perm] ?? perm}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink-muted">Aucune permission spécifique.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
