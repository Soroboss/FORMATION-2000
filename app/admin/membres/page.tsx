import Link from "next/link";
import { listMembers } from "@/server/repositories/admin-members";

export default async function AdminMembresPage() {
  const members = await listMembers();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Membres</h1>
        <p className="mt-1 text-sm text-slate-600">{members.length} profil(s).</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Membre</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Rôles</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-slate-100">
                <td className="px-4 py-3">
                  <Link href={`/admin/membres/${m.id}`} className="font-medium text-brand-800 hover:underline">
                    {m.displayName ?? m.email ?? m.id}
                  </Link>
                  <p className="text-xs text-slate-500">{m.email}</p>
                </td>
                <td className="px-4 py-3">{m.status}</td>
                <td className="px-4 py-3 text-xs">{m.roles.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
