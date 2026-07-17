import Link from "next/link";
import { MessageCircle } from "lucide-react";
import {
  approveManualPaymentAction,
  rejectManualPaymentAction,
} from "@/server/actions/manual-payments";
import { listPendingManualPaymentRequests } from "@/server/repositories/manual-payments";
import { Button } from "@/components/ui/button";
import { ActionFlash } from "@/components/ui/action-flash";
import { AdminEmptyState, AdminPageHeader, AdminStatCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminPaiementsManuelsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const flash = await searchParams;
  const pending = await listPendingManualPaymentRequests();
  const pendingTotal = pending.reduce((sum, r) => sum + r.amount, 0);
  const currency = pending[0]?.currency ?? "XOF";

  return (
    <section className="space-y-6">
      <AdminPageHeader
        icon={MessageCircle}
        title="Paiements WhatsApp"
        description="Vérifiez la capture, puis approuvez pour activer 30 jours d’accès."
        actions={
          <Link
            href="/admin/paiements"
            className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
          >
            Historique
          </Link>
        }
      />
      <ActionFlash ok={flash.ok} error={flash.error} />

      {pending.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminStatCard label="En attente" value={pending.length} tone="warning" />
          <AdminStatCard
            label="Montant à confirmer"
            value={`${pendingTotal.toLocaleString("fr-FR")} ${currency}`}
            tone="info"
          />
        </div>
      ) : null}
      {pending.length === 0 ? (
        <AdminEmptyState
          title="Aucune demande en attente"
          description="Les demandes Mobile Money + WhatsApp arriveront ici."
          actionHref="/admin/paiements"
          actionLabel="Voir l’historique"
        />
      ) : (
        <ul className="space-y-4">
          {pending.map((req) => (
            <li key={req.id} className="ui-card p-5 sm:p-6">
              <p className="font-display text-lg font-semibold text-ink">
                {req.amount.toLocaleString("fr-FR")} {req.currency} · {req.network ?? "—"}
              </p>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Membre
                  </dt>
                  <dd>
                    <Link
                      href={`/admin/membres/${req.userId}`}
                      className="font-semibold text-brand-700 hover:underline"
                    >
                      Ouvrir le profil
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Téléphone
                  </dt>
                  <dd className="text-ink">{req.payerPhone}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Nom
                  </dt>
                  <dd className="text-ink">{req.payerName ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Réf.
                  </dt>
                  <dd className="text-ink">{req.transactionRef ?? "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Note
                  </dt>
                  <dd className="text-ink">{req.note ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Reçu le
                  </dt>
                  <dd className="text-ink">{new Date(req.createdAt).toLocaleString("fr-FR")}</dd>
                </div>
              </dl>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <form action={approveManualPaymentAction} className="space-y-2">
                  <input type="hidden" name="id" value={req.id} />
                  <input type="hidden" name="returnTo" value="/admin/paiements-manuels" />
                  <input
                    name="reviewNote"
                    placeholder="Note d'approbation (optionnel)"
                    className="w-full rounded-soft border border-canvas-border px-3 py-2 text-sm"
                  />
                  <Button type="submit" className="w-full" variant="secondary">
                    Approuver & activer l&apos;accès
                  </Button>
                </form>
                <form action={rejectManualPaymentAction} className="space-y-2">
                  <input type="hidden" name="id" value={req.id} />
                  <input type="hidden" name="returnTo" value="/admin/paiements-manuels" />
                  <input
                    name="reviewNote"
                    placeholder="Motif du refus"
                    className="w-full rounded-soft border border-canvas-border px-3 py-2 text-sm"
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
