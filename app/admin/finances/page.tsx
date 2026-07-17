import { listFinancePayments } from "@/server/repositories/admin-payments";
import { AdminEmptyState, AdminPageHeader } from "@/components/admin/ui";
import { FinanceCsvButton } from "@/components/admin/finance-csv-button";
import { buildPaymentsCsv, computeFinanceSummary } from "@/lib/admin/finance";

export const dynamic = "force-dynamic";

function formatAmount(value: number, currency: string): string {
  return `${value.toLocaleString("fr-FR")} ${currency}`;
}

function StatBlock({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "brand" | "progress" | "action" | "danger";
}) {
  const accentClass =
    accent === "progress"
      ? "text-progress-700"
      : accent === "action"
        ? "text-action-700"
        : accent === "danger"
          ? "text-red-700"
          : "text-ink";
  return (
    <div className="ui-card p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={`mt-2 font-display text-2xl font-bold ${accentClass}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}

export default async function AdminFinancesPage() {
  const payments = await listFinancePayments();
  const summary = computeFinanceSummary(payments);
  const csv = buildPaymentsCsv(payments);
  const today = new Date().toISOString().slice(0, 10);
  const c = summary.currency;

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Finances"
        description="Chiffre d'affaires encaissé, frais des fournisseurs et revenu net."
        actions={
          payments.length > 0 ? (
            <FinanceCsvButton csv={csv} filename={`paiements-${today}.csv`} />
          ) : undefined
        }
      />

      {payments.length === 0 ? (
        <AdminEmptyState
          title="Aucune donnée financière"
          description="Les paiements encaissés alimenteront ce tableau de bord."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatBlock
              label="CA brut encaissé"
              value={formatAmount(summary.grossTotal, c)}
              hint={`${summary.settledCount} transaction(s)`}
            />
            <StatBlock
              label="Frais fournisseurs"
              value={formatAmount(summary.feesTotal, c)}
              hint="commissions PSP"
              accent="danger"
            />
            <StatBlock
              label="CA net"
              value={formatAmount(summary.netTotal, c)}
              hint="après frais"
              accent="progress"
            />
            <StatBlock
              label="Net sur 30 jours"
              value={formatAmount(summary.last30Net, c)}
              hint={`${summary.last30Count} transaction(s)`}
              accent="brand"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatBlock label="Encaissés" value={String(summary.settledCount)} accent="progress" />
            <StatBlock label="En attente" value={String(summary.pendingCount)} accent="action" />
            <StatBlock label="Échoués" value={String(summary.failedCount)} accent="danger" />
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold text-ink">Par fournisseur</h2>
            <div className="ui-card overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-canvas-border bg-canvas/60 text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="px-4 py-3">Fournisseur</th>
                    <th className="px-4 py-3">Transactions</th>
                    <th className="px-4 py-3">Brut</th>
                    <th className="px-4 py-3">Frais</th>
                    <th className="px-4 py-3">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.byProvider.map((row) => (
                    <tr key={row.provider} className="border-b border-canvas-border last:border-0">
                      <td className="px-4 py-3 font-semibold text-ink">{row.provider}</td>
                      <td className="px-4 py-3 text-ink-muted">{row.count}</td>
                      <td className="px-4 py-3 text-ink">{formatAmount(row.gross, c)}</td>
                      <td className="px-4 py-3 text-red-700">{formatAmount(row.fees, c)}</td>
                      <td className="px-4 py-3 font-semibold text-progress-700">
                        {formatAmount(row.net, c)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold text-ink">Par mois (6 derniers)</h2>
            <div className="ui-card overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-canvas-border bg-canvas/60 text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="px-4 py-3">Mois</th>
                    <th className="px-4 py-3">Transactions</th>
                    <th className="px-4 py-3">Brut</th>
                    <th className="px-4 py-3">Frais</th>
                    <th className="px-4 py-3">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.byMonth.map((row) => (
                    <tr key={row.month} className="border-b border-canvas-border last:border-0">
                      <td className="px-4 py-3 font-semibold capitalize text-ink">{row.label}</td>
                      <td className="px-4 py-3 text-ink-muted">{row.count}</td>
                      <td className="px-4 py-3 text-ink">{formatAmount(row.gross, c)}</td>
                      <td className="px-4 py-3 text-red-700">{formatAmount(row.fees, c)}</td>
                      <td className="px-4 py-3 font-semibold text-progress-700">
                        {formatAmount(row.net, c)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
