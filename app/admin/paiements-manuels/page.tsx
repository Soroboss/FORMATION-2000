import {
  approveManualPaymentAction,
  rejectManualPaymentAction,
} from "@/server/actions/manual-payments";
import { listPendingManualPaymentRequests } from "@/server/repositories/manual-payments";
import { Button } from "@/components/ui/button";

export default async function AdminPaiementsManuelsPage() {
  const pending = await listPendingManualPaymentRequests();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">
          Paiements manuels
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Vérifiez la capture WhatsApp, puis approuvez pour activer 30 jours d&apos;accès.
        </p>
      </div>

      {pending.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          Aucune demande en attente.
        </p>
      ) : (
        <ul className="space-y-4">
          {pending.map((req) => (
            <li key={req.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                {req.amount.toLocaleString("fr-FR")} {req.currency} · {req.network ?? "—"}
              </p>
              <dl className="mt-2 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
                <div>
                  <dt className="uppercase tracking-wide text-slate-400">User</dt>
                  <dd className="font-mono">{req.userId}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-slate-400">Téléphone</dt>
                  <dd>{req.payerPhone}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-slate-400">Nom</dt>
                  <dd>{req.payerName ?? "—"}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-slate-400">Réf.</dt>
                  <dd>{req.transactionRef ?? "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="uppercase tracking-wide text-slate-400">Note</dt>
                  <dd>{req.note ?? "—"}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-slate-400">Reçu le</dt>
                  <dd>{new Date(req.createdAt).toLocaleString("fr-FR")}</dd>
                </div>
              </dl>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <form action={approveManualPaymentAction} className="space-y-2">
                  <input type="hidden" name="id" value={req.id} />
                  <input
                    name="reviewNote"
                    placeholder="Note d'approbation (optionnel)"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <Button type="submit" className="w-full" variant="secondary">
                    Approuver & activer l&apos;accès
                  </Button>
                </form>
                <form action={rejectManualPaymentAction} className="space-y-2">
                  <input type="hidden" name="id" value={req.id} />
                  <input
                    name="reviewNote"
                    placeholder="Motif du refus"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <Button type="submit" className="w-full" variant="outline">
                    Refuser
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
