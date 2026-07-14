import Link from "next/link";
import { listAdminPayments } from "@/server/repositories/admin-payments";
import { AdminEmptyState, AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { paymentStatusLabel } from "@/lib/admin/labels";

export default async function AdminPaiementsPage() {
  const payments = await listAdminPayments();

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Paiements"
        description="Historique global des transactions."
        actions={
          <Link
            href="/admin/paiements-manuels"
            className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
          >
            WhatsApp en attente
          </Link>
        }
      />

      {payments.length === 0 ? (
        <AdminEmptyState
          title="Aucun paiement"
          description="Les paiements confirmés ou initiés apparaîtront ici."
        />
      ) : (
        <div className="ui-card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-canvas-border bg-canvas/60 text-xs uppercase tracking-wide text-ink-muted">
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
                <tr key={p.id} className="border-b border-canvas-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-ink">{p.internalReference}</td>
                  <td className="px-4 py-3 font-semibold text-ink">
                    {p.amount.toLocaleString("fr-FR")} {p.currency}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={p.status} label={paymentStatusLabel(p.status)} />
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{p.provider}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {new Date(p.initiatedAt).toLocaleString("fr-FR")}
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
