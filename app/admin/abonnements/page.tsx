import Link from "next/link";
import { Repeat } from "lucide-react";
import { extendSubscriptionAction } from "@/server/actions/admin-ops";
import { listAdminSubscriptions } from "@/server/repositories/admin-payments";
import { Button } from "@/components/ui/button";
import { ActionFlash } from "@/components/ui/action-flash";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminStatCard,
  StatusBadge,
} from "@/components/admin/ui";
import { subscriptionStatusLabel } from "@/lib/admin/labels";

export const dynamic = "force-dynamic";

export default async function AdminAbonnementsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const flash = await searchParams;
  const subscriptions = await listAdminSubscriptions();
  const active = subscriptions.filter((s) => s.status === "active").length;
  const grace = subscriptions.filter((s) => s.status === "grace_period").length;
  const expired = subscriptions.filter((s) => s.status === "expired").length;

  return (
    <section className="space-y-6">
      <AdminPageHeader
        icon={Repeat}
        title="Abonnements"
        description="Liste et prolongation manuelle (30 jours typiques)."
      />
      <ActionFlash ok={flash.ok} error={flash.error} />

      {subscriptions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard label="Total" value={subscriptions.length} />
          <AdminStatCard label="Actifs" value={active} tone="success" />
          <AdminStatCard label="Période de grâce" value={grace} tone="warning" />
          <AdminStatCard label="Expirés" value={expired} tone="danger" />
        </div>
      ) : null}

      {subscriptions.length === 0 ? (
        <AdminEmptyState
          title="Aucun abonnement"
          description="Les abonnements confirmés apparaîtront ici."
          actionHref="/admin/paiements-manuels"
          actionLabel="Voir paiements WhatsApp"
        />
      ) : (
        <div className="ui-card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-canvas-border bg-canvas/60 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Fin</th>
                <th className="px-4 py-3">Prolonger</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-canvas-border last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/membres/${sub.userId}`}
                      className="font-semibold text-brand-700 hover:underline"
                    >
                      Voir le membre
                    </Link>
                    <p className="font-mono text-xs text-ink-muted">{sub.userId.slice(0, 8)}…</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      value={sub.status}
                      label={subscriptionStatusLabel(sub.status)}
                    />
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {sub.endsAt ? new Date(sub.endsAt).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <form action={extendSubscriptionAction} className="flex items-center gap-2">
                      <input type="hidden" name="subscriptionId" value={sub.id} />
                      <input type="hidden" name="returnTo" value="/admin/abonnements" />
                      <input
                        name="days"
                        type="number"
                        defaultValue={30}
                        className="w-20 rounded-soft border border-canvas-border px-2 py-1 text-sm"
                      />
                      <Button type="submit" size="sm" variant="secondary">
                        + jours
                      </Button>
                    </form>
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
