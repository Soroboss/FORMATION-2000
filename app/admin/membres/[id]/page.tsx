import Link from "next/link";
import { notFound } from "next/navigation";
import {
  assignRoleAction,
  removeRoleAction,
  updateMemberStatusAction,
} from "@/server/actions/admin-ops";
import { getMember } from "@/server/repositories/admin-members";
import { ROLE_KEYS } from "@/lib/permissions/roles";
import { Button } from "@/components/ui/button";

export default async function AdminMembreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) notFound();

  return (
    <section className="space-y-6">
      <div>
        <Link href="/admin/membres" className="text-sm text-brand-700 hover:underline">
          ← Membres
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900">
          {member.displayName ?? member.email}
        </h1>
        <p className="text-sm text-slate-500">{member.email}</p>
      </div>

      <form action={updateMemberStatusAction} className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input type="hidden" name="userId" value={member.id} />
        <label className="text-sm">
          <span className="font-medium">Statut</span>
          <select name="status" defaultValue={member.status} className="mt-1 block rounded-lg border border-slate-300 px-3 py-2">
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
            <option value="deleted">Supprimé</option>
          </select>
        </label>
        <Button type="submit" size="sm">
          Mettre à jour
        </Button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Rôles</h2>
        <p className="mt-1 text-sm text-slate-600">{member.roles.join(", ")}</p>
        <form action={assignRoleAction} className="mt-4 flex flex-wrap gap-2">
          <input type="hidden" name="userId" value={member.id} />
          <select name="roleKey" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {ROLE_KEYS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" variant="secondary">
            Attribuer
          </Button>
        </form>
        <form action={removeRoleAction} className="mt-2 flex flex-wrap gap-2">
          <input type="hidden" name="userId" value={member.id} />
          <select name="roleKey" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {member.roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" variant="outline">
            Retirer
          </Button>
        </form>
      </div>
    </section>
  );
}
