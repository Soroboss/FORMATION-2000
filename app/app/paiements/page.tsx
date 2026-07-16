import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, Receipt } from "lucide-react";
import { PageHeader, StatCard, StatusBadge } from "@/components/app/page-header";
import { getSession } from "@/lib/auth/session";
import { listPaymentsForUser } from "@/server/repositories/payments";

function paymentTone(status: string): "progress" | "action" | "danger" | "neutral" {
  const s = status.toLowerCase();
  if (["success", "succeeded", "completed", "paid", "approved"].includes(s)) return "progress";
  if (["pending", "processing", "initiated"].includes(s)) return "action";
  if (["failed", "rejected", "cancelled", "canceled", "refunded"].includes(s)) return "danger";
  return "neutral";
}

export default async function PaiementsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }

  const payments = await listPaymentsForUser(session.user.id);
  const successful = payments.filter((p) =>
    ["success", "succeeded", "completed", "paid", "approved"].includes(p.status.toLowerCase()),
  );
  const totalPaid = successful.reduce((acc, p) => acc + p.amount, 0);
  const currency = payments[0]?.currency ?? "FCFA";

  return (
    <section className="space-y-6">
      <PageHeader
        icon={Receipt}
        title="Mes paiements"
        subtitle="Historique de vos transactions."
        action={
          <Link
            href="/app/abonnement"
            className="inline-flex h-10 items-center gap-2 rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
          >
            <CreditCard className="h-4 w-4" strokeWidth={2} aria-hidden />
            Abonnement
          </Link>
        }
      />

      {payments.length === 0 ? (
        <div className="ui-card border-dashed p-6 text-center sm:p-8">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Receipt className="h-6 w-6" strokeWidth={2} aria-hidden />
          </span>
          <p className="font-display font-semibold text-ink">Aucun paiement pour le moment</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Activez l&apos;accès mensuel pour débloquer les formations premium.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/paiement"
              className="inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Payer 2 000 FCFA
            </Link>
            <Link
              href="/paiement/manuel"
              className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              WhatsApp / Mobile Money
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Transactions" value={payments.length} hint="au total" />
            <StatCard
              label="Total payé"
              value={`${totalPaid.toLocaleString("fr-FR")} ${currency}`}
              tone="progress"
              hint={`${successful.length} paiement${successful.length > 1 ? "s" : ""} validé${successful.length > 1 ? "s" : ""}`}
            />
          </div>

          <ul className="space-y-3">
            {payments.map((payment) => (
              <li key={payment.id} className="ui-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-lg font-bold text-ink">
                    {payment.amount.toLocaleString("fr-FR")}{" "}
                    <span className="text-sm font-normal text-ink-muted">{payment.currency}</span>
                  </p>
                  <StatusBadge label={payment.status} tone={paymentTone(payment.status)} />
                </div>
                <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-ink-muted">
                  <span className="font-mono">{payment.internalReference}</span>
                  <span aria-hidden>·</span>
                  <span className="capitalize">{payment.provider}</span>
                  <span aria-hidden>·</span>
                  <span>{new Date(payment.initiatedAt).toLocaleString("fr-FR")}</span>
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
