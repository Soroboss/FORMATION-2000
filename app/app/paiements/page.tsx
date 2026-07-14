import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { listPaymentsForUser } from "@/server/repositories/payments";

export default async function PaiementsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }

  const payments = await listPaymentsForUser(session.user.id);

  return (
    <section className="space-y-6">
      <div className="ui-card p-5 sm:p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Mes paiements</h1>
        <p className="mt-1 text-sm text-ink-muted">Historique de vos transactions.</p>
      </div>

      {payments.length === 0 ? (
        <div className="ui-card border-dashed p-6 text-center">
          <p className="font-display font-semibold text-ink">Aucun paiement pour le moment</p>
          <p className="mt-2 text-sm text-ink-muted">
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
        <ul className="space-y-3">
          {payments.map((payment) => (
            <li key={payment.id} className="ui-card p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-ink">
                  {payment.amount.toLocaleString("fr-FR")} {payment.currency}
                </p>
                <span className="rounded-soft bg-canvas px-2 py-1 text-xs font-medium capitalize text-ink-muted">
                  {payment.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                {payment.internalReference} · {payment.provider} ·{" "}
                {new Date(payment.initiatedAt).toLocaleString("fr-FR")}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm">
        <Link href="/app/abonnement" className="font-semibold text-brand-600 hover:underline">
          Gérer l&apos;abonnement
        </Link>
      </p>
    </section>
  );
}
