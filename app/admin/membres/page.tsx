import Link from "next/link";
import { listMembers, listStaffMembers } from "@/server/repositories/admin-members";
import { getSession } from "@/lib/auth/session";
import { assignableRolesForActor, isStaff } from "@/lib/permissions/roles";
import { AdminEmptyState, AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { InviteCollaboratorForm } from "@/components/admin/invite-collaborator-form";
import { memberStatusLabel, roleLabel } from "@/lib/admin/labels";

export default async function AdminMembresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const assignableRoles = assignableRolesForActor(session?.roles ?? []);

  const view = params.view === "staff" ? "staff" : "all";
  const [allMembers, staff] = await Promise.all([listMembers(), listStaffMembers()]);
  const query = (params.q ?? "").trim().toLowerCase();

  const source = view === "staff" ? staff : allMembers;
  const members = query
    ? source.filter((m) => {
        const hay = `${m.email ?? ""} ${m.displayName ?? ""} ${m.firstName ?? ""} ${m.lastName ?? ""} ${m.roles.join(" ")}`.toLowerCase();
        return hay.includes(query);
      })
    : source;

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Membres & équipe"
        description="Apprenants inscrits et collaborateurs de l’administration (rôles & restrictions)."
      />

      <div className="ui-card space-y-4 border-2 border-brand-200 p-5 sm:p-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">
            Ajouter un collaborateur
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Créez un compte équipe avec un rôle limité (support, formateur, admin…). Il accédera à
            l’espace administration selon ses permissions.
          </p>
        </div>
        <InviteCollaboratorForm assignableRoles={assignableRoles.filter((r) => r !== "learner")} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/membres"
          className={`rounded-brand px-3 py-1.5 text-sm font-semibold ${
            view === "all" ? "bg-brand-600 text-white" : "border border-canvas-border text-ink"
          }`}
        >
          Tous ({allMembers.length})
        </Link>
        <Link
          href="/admin/membres?view=staff"
          className={`rounded-brand px-3 py-1.5 text-sm font-semibold ${
            view === "staff" ? "bg-brand-600 text-white" : "border border-canvas-border text-ink"
          }`}
        >
          Équipe ({staff.length})
        </Link>
        <form className="ml-auto flex gap-2">
          {view === "staff" ? <input type="hidden" name="view" value="staff" /> : null}
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Rechercher e-mail ou nom…"
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
          />
          <button
            type="submit"
            className="h-10 rounded-brand bg-slate-900 px-3 text-sm font-semibold text-white"
          >
            Filtrer
          </button>
        </form>
      </div>

      {members.length === 0 ? (
        <AdminEmptyState
          title={view === "staff" ? "Aucun collaborateur" : "Aucun membre"}
          description={
            view === "staff"
              ? "Créez le premier collaborateur avec le formulaire ci-dessus."
              : "Les inscriptions apparaîtront ici."
          }
        />
      ) : (
        <div className="ui-card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-canvas-border bg-canvas/60 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Membre</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Rôles</th>
                <th className="px-4 py-3">Type</th>
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
                    {m.phone ? <p className="text-xs text-ink-muted">{m.phone}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={m.status} label={memberStatusLabel(m.status)} />
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {m.roles.map(roleLabel).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {isStaff(m.roles) ? (
                      <span className="font-semibold text-slate-900">Équipe</span>
                    ) : (
                      <span className="text-ink-muted">Apprenant</span>
                    )}
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
