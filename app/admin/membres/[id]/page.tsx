import Link from "next/link";
import { notFound } from "next/navigation";
import {
  activateLearnerAccessAction,
  assignRoleAction,
  removeRoleAction,
  updateMemberStatusAction,
} from "@/server/actions/admin-ops";
import { getMember } from "@/server/repositories/admin-members";
import {
  getLatestSubscriptionForUser,
  userHasPremiumAccess,
} from "@/server/repositories/payments";
import { getSession } from "@/lib/auth/session";
import {
  assignableRolesForActor,
  canManageMemberRoles,
  ROLE_DESCRIPTIONS,
} from "@/lib/permissions/roles";
import { Button } from "@/components/ui/button";
import { ActionFlash } from "@/components/ui/action-flash";
import { StatusBadge } from "@/components/admin/ui";
import { memberStatusLabel, roleLabel, subscriptionStatusLabel } from "@/lib/admin/labels";

export default async function AdminMembreDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; access?: string; ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const { created, access, ok, error } = await searchParams;
  const [member, session] = await Promise.all([getMember(id), getSession()]);
  if (!member) notFound();

  const [subscription, hasPremium] = await Promise.all([
    getLatestSubscriptionForUser(member.id),
    userHasPremiumAccess(member.id),
  ]);

  const canManage = canManageMemberRoles(session?.roles ?? []);
  const canGrantAccess = Boolean(session); // tout admin connecté (layout déjà filtré)
  const assignable = assignableRolesForActor(session?.roles ?? []);
  const removable = member.roles.filter((r) => assignable.includes(r));

  return (
    <section className="space-y-6">
      <ActionFlash ok={ok} error={error} />
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
          <StatusBadge
            value={hasPremium ? "active" : "expired"}
            label={hasPremium ? "Accès premium actif" : "Sans accès premium"}
          />
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
        {access === "1" ? (
          <p className="mt-4 rounded-soft border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Accès apprenant activé / prolongé. L’apprenant peut maintenant suivre les formations
            premium.
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

      {canGrantAccess ? (
        <div className="ui-card space-y-4 border-2 border-brand-200 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Accès formations (premium)
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Activez manuellement l’accès après un paiement WhatsApp / Mobile Money, un test, ou
              une faveur. Cela ouvre le catalogue payant pendant la durée choisie.
            </p>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-soft bg-canvas px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Statut abonnement
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {subscription
                  ? subscriptionStatusLabel(subscription.status)
                  : "Aucun"}
              </dd>
            </div>
            <div className="rounded-soft bg-canvas px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Expire le
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {subscription?.endsAt
                  ? new Date(subscription.endsAt).toLocaleString("fr-FR")
                  : "—"}
              </dd>
            </div>
            <div className="rounded-soft bg-canvas px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Source
              </dt>
              <dd className="mt-1 font-medium text-ink break-all">
                {subscription?.source ?? "—"}
              </dd>
            </div>
          </dl>

          <form
            action={activateLearnerAccessAction}
            className="grid gap-3 border-t border-canvas-border pt-4 sm:grid-cols-[120px_1fr_auto]"
          >
            <input type="hidden" name="userId" value={member.id} />
            <input type="hidden" name="returnTo" value={`/admin/membres/${member.id}`} />
            <label className="block text-sm">
              <span className="font-medium text-ink">Jours</span>
              <input
                name="days"
                type="number"
                min={1}
                max={365}
                defaultValue={30}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-ink">Note (optionnel)</span>
              <input
                name="note"
                placeholder="Ex. Paiement Orange reçu le…"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <div className="flex items-end">
              <Button type="submit" className="w-full sm:w-auto">
                {hasPremium ? "Prolonger l’accès" : "Activer l’accès"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {canManage ? (
        <form
          action={updateMemberStatusAction}
          className="ui-card flex flex-wrap items-end gap-3 p-5 sm:p-6"
        >
          <input type="hidden" name="userId" value={member.id} />
          <input type="hidden" name="returnTo" value={`/admin/membres/${member.id}`} />
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
          <h2 className="font-display font-semibold text-ink">Rôles & accès admin</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Les rôles définissent ce que la personne peut faire dans l’administration.
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
              <input type="hidden" name="returnTo" value={`/admin/membres/${member.id}`} />
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
                <input type="hidden" name="returnTo" value={`/admin/membres/${member.id}`} />
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
