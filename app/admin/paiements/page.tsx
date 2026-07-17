import Link from "next/link";
import { CreditCard } from "lucide-react";
import { listAdminPayments } from "@/server/repositories/admin-payments";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminStatCard,
  StatusBadge,
} from "@/components/admin/ui";
import { RefundButton } from "@/components/admin/refund-button";
import { paymentStatusLabel } from "@/lib/admin/labels";
import { getSession } from "@/lib/auth/session";
import { hasAnyRole } from "@/lib/permissions/roles";

export const dynamic = "force-dynamic";

export default async function AdminPaiementsPage() {
  const [payments, session] = await Promise.all([listAdminPayments(), getSession()]);
  const canRefund = hasAnyRole(session?.roles ?? [], ["admin", "super_admin"]);
  const settled = payments.filter((p) => p.status === "successful");
  const settledTotal = settled.reduce((sum, p) => sum + p.amount, 0);
  const currency = payments[0]?.currency ?? "XOF";

  return (
    <section className="space-y-6">
      <AdminPageHeader
        icon={CreditCard}
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

      {payments.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminStatCard label="Transactions" value={payments.length} />
          <AdminStatCard label="Encaissées" value={settled.length} tone="success" />
          <AdminStatCard
            label="Montant encaissé"
            value={`${settledTotal.toLocaleString("fr-FR")} ${currency}`}
            tone="info"
          />
        </div>
      ) : null}

      {payments.length === 0 ? (
        <AdminEmptyState
          title="Aucun paiement"
          description="Les paiements confirmés ou initiés apparaîtront ici."
        />
      ) : (
        <div className="ui-card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-canvas-border bg-canvas/60 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Fournisseur</th>
                <th className="px-4 py-3">Date</th>
                {canRefund ? <th className="px-4 py-3 text-right">Action</th> : null}
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
                  {canRefund ? (
                    <td className="px-4 py-3 text-right">
                      {p.status === "successful" ? (
                        <RefundButton paymentId={p.id} />
                      ) : (
                        <span className="text-xs text-ink-muted">—</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
