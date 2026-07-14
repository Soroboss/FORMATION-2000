import Link from "next/link";
import { notFound } from "next/navigation";
import {
  assignRoleAction,
  removeRoleAction,
  updateMemberStatusAction,
} from "@/server/actions/admin-ops";
import { getMember } from "@/server/repositories/admin-members";
import { getSession } from "@/lib/auth/session";
import {
  assignableRolesForActor,
  canManageMemberRoles,
  ROLE_DESCRIPTIONS,
} from "@/lib/permissions/roles";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/ui";
import { memberStatusLabel, roleLabel } from "@/lib/admin/labels";

export default async function AdminMembreDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const [member, session] = await Promise.all([getMember(id), getSession()]);
  if (!member) notFound();

  const canManage = canManageMemberRoles(session?.roles ?? []);
  const assignable = assignableRolesForActor(session?.roles ?? []);
  const removable = member.roles.filter((r) => assignable.includes(r));

  return (
    <section className="space-y-6">
      <div className="ui-card p-5 sm:p-6">
        <Link href="/admin/membres" className="text-sm font-semibold text-brand-600 hover:underline">
          ← Membres
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">
          {member.displayName ?? member.email}
        </h1>
        <p className="text-sm text-ink-muted">{member.email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge value={member.status} label={memberStatusLabel(member.status)} />
          {member.roles.map((r) => (
            <StatusBadge key={r} value={r} label={roleLabel(r)} />
          ))}
        </div>
        {created === "1" ? (
          <p className="mt-4 rounded-soft border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Collaborateur créé. Communiquez-lui son e-mail et le mot de passe temporaire, puis
            demandez-lui de se connecter sur /connexion.
          </p>
        ) : null}
      </div>

      <div className="ui-card grid gap-3 p-5 text-sm sm:grid-cols-2 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Téléphone</p>
          <p className="mt-1 text-ink">{member.phone ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Inscription</p>
          <p className="mt-1 text-ink">
            {new Date(member.createdAt).toLocaleString("fr-FR")}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Dernière connexion
          </p>
          <p className="mt-1 text-ink">
            {member.lastLoginAt
              ? new Date(member.lastLoginAt).toLocaleString("fr-FR")
              : "—"}
          </p>
        </div>
      </div>

      {canManage ? (
        <form
          action={updateMemberStatusAction}
          className="ui-card flex flex-wrap items-end gap-3 p-5 sm:p-6"
        >
          <input type="hidden" name="userId" value={member.id} />
          <label className="text-sm">
            <span className="font-medium">Statut du compte</span>
            <select
              name="status"
              defaultValue={member.status}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="deleted">Supprimé</option>
            </select>
          </label>
          <Button type="submit" size="sm">
            Mettre à jour
          </Button>
        </form>
      ) : null}

      <div className="ui-card space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="font-display font-semibold text-ink">Rôles & accès</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Les rôles définissent ce que la personne peut faire dans l’admin (restrictions).
          </p>
        </div>

        <ul className="space-y-2 text-sm">
          {member.roles.map((role) => (
            <li key={role} className="rounded-soft bg-canvas px-3 py-2">
              <span className="font-semibold text-ink">{roleLabel(role)}</span>
              <span className="mt-0.5 block text-xs text-ink-muted">
                {ROLE_DESCRIPTIONS[role]}
              </span>
            </li>
          ))}
        </ul>

        {canManage && assignable.length > 0 ? (
          <>
            <form action={assignRoleAction} className="flex flex-wrap gap-2 border-t border-canvas-border pt-4">
              <input type="hidden" name="userId" value={member.id} />
              <select name="roleKey" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {assignable.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(role)}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm" variant="secondary">
                Attribuer le rôle
              </Button>
            </form>
            {removable.length > 0 ? (
              <form action={removeRoleAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="userId" value={member.id} />
                <select name="roleKey" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  {removable.map((role) => (
                    <option key={role} value={role}>
                      {roleLabel(role)}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm" variant="outline">
                  Retirer le rôle
                </Button>
              </form>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-ink-muted">
            Vous n’avez pas la permission de modifier les rôles de ce compte.
          </p>
        )}
      </div>
    </section>
  );
}
