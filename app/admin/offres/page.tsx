import { listPlansAdmin } from "@/server/repositories/admin-plans";
import { togglePlanAction, updatePlanAction } from "@/server/actions/admin-plans";
import { AdminEmptyState, AdminPageHeader } from "@/components/admin/ui";
import { PlanForm } from "@/components/admin/plan-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-brand border border-canvas-border bg-canvas-card px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

export default async function AdminOffresPage() {
  const plans = await listPlansAdmin();

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Offres & tarifs"
        description="Gérez plusieurs plans, devises et durées d'abonnement."
      />

      <PlanForm />

      {plans.length === 0 ? (
        <AdminEmptyState title="Aucune offre" description="Créez votre première offre ci-dessus." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.id} className="ui-card space-y-4 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">{plan.name}</h3>
                  <p className="font-mono text-xs text-ink-muted">{plan.slug}</p>
                </div>
                <span
                  className={`inline-flex rounded-soft px-2 py-1 text-xs font-semibold ${
                    plan.isActive ? "bg-progress-50 text-progress-700" : "bg-canvas text-ink-muted"
                  }`}
                >
                  {plan.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <form action={updatePlanAction} className="space-y-3">
                <input type="hidden" name="id" value={plan.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-ink-muted">Nom</label>
                    <input name="name" defaultValue={plan.name} className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-ink-muted">Prix</label>
                    <input name="priceAmount" type="number" min={0} defaultValue={plan.priceAmount} className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-ink-muted">Devise</label>
                    <input name="currency" defaultValue={plan.currency} className={`${inputClass} uppercase`} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-ink-muted">Durée (jours)</label>
                    <input name="durationDays" type="number" min={1} defaultValue={plan.durationDays} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-ink-muted">Description</label>
                    <input name="description" defaultValue={plan.description ?? ""} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-ink-muted">
                      Avantages (un par ligne)
                    </label>
                    <textarea
                      name="features"
                      rows={3}
                      defaultValue={plan.features.join("\n")}
                      className={inputClass}
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" variant="secondary">Enregistrer</Button>
              </form>

              <form action={togglePlanAction} className="border-t border-canvas-border pt-3">
                <input type="hidden" name="id" value={plan.id} />
                <input type="hidden" name="isActive" value={plan.isActive ? "false" : "true"} />
                <button
                  type="submit"
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  {plan.isActive ? "Désactiver l'offre" : "Activer l'offre"}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
