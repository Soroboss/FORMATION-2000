import { listAdminPayments } from "@/server/repositories/admin-payments";

export default async function AdminPaiementsPage() {
  const payments = await listAdminPayments();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Paiements</h1>
        <p className="mt-1 text-sm text-slate-600">Historique global.</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Référence</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Fournisseur</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-mono text-xs">{p.internalReference}</td>
                <td className="px-4 py-3">
                  {p.amount.toLocaleString("fr-FR")} {p.currency}
                </td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3">{p.provider}</td>
                <td className="px-4 py-3">
                  {new Date(p.initiatedAt).toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">Aucun paiement.</p>
        ) : null}
      </div>
    </section>
  );
}
