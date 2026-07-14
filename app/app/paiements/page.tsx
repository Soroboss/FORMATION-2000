import { getSession } from "@/lib/auth/session";
import { listPaymentsForUser } from "@/server/repositories/payments";

export default async function PaiementsPage() {
  const session = await getSession();
  if (!session) return null;

  const payments = await listPaymentsForUser(session.user.id);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Mes paiements</h1>
        <p className="mt-1 text-sm text-slate-600">Historique de vos transactions.</p>
      </div>

      {payments.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          Aucun paiement pour le moment.
        </p>
      ) : (
        <ul className="space-y-3">
          {payments.map((payment) => (
            <li
              key={payment.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">
                  {payment.amount.toLocaleString("fr-FR")} {payment.currency}
                </p>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-700">
                  {payment.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {payment.internalReference} · {payment.provider} ·{" "}
                {new Date(payment.initiatedAt).toLocaleString("fr-FR")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
