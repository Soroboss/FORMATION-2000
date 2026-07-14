import { extendSubscriptionAction } from "@/server/actions/admin-ops";
import { listAdminSubscriptions } from "@/server/repositories/admin-payments";
import { Button } from "@/components/ui/button";

export default async function AdminAbonnementsPage() {
  const subscriptions = await listAdminSubscriptions();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Abonnements</h1>
        <p className="mt-1 text-sm text-slate-600">Liste et prolongation manuelle.</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Fin</th>
              <th className="px-4 py-3">Prolonger</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-mono text-xs">{sub.userId.slice(0, 8)}…</td>
                <td className="px-4 py-3">{sub.status}</td>
                <td className="px-4 py-3">
                  {sub.endsAt ? new Date(sub.endsAt).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="px-4 py-3">
                  <form action={extendSubscriptionAction} className="flex items-center gap-2">
                    <input type="hidden" name="subscriptionId" value={sub.id} />
                    <input
                      name="days"
                      type="number"
                      defaultValue={30}
                      className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
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
        {subscriptions.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">Aucun abonnement.</p>
        ) : null}
      </div>
    </section>
  );
}
