import { listCoupons } from "@/server/repositories/coupons";
import { listActivePlans } from "@/server/repositories/payments";
import { toggleCouponAction } from "@/server/actions/coupons";
import { AdminEmptyState, AdminPageHeader } from "@/components/admin/ui";
import { CouponForm } from "@/components/admin/coupon-form";

export const dynamic = "force-dynamic";

function formatDiscount(type: string, value: number, currency: string): string {
  return type === "percent" ? `-${value}%` : `-${value.toLocaleString("fr-FR")} ${currency}`;
}

function formatWindow(startsAt: string | null, endsAt: string | null): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR");
  if (startsAt && endsAt) return `${fmt(startsAt)} → ${fmt(endsAt)}`;
  if (endsAt) return `jusqu'au ${fmt(endsAt)}`;
  if (startsAt) return `dès le ${fmt(startsAt)}`;
  return "sans limite de date";
}

export default async function AdminCouponsPage() {
  const [coupons, plans] = await Promise.all([listCoupons(), listActivePlans()]);

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Coupons & promotions"
        description="Créez des codes de réduction appliqués automatiquement au paiement."
      />

      <CouponForm plans={plans.map((p) => ({ id: p.id, name: p.name }))} />

      {coupons.length === 0 ? (
        <AdminEmptyState
          title="Aucun code promo"
          description="Créez votre premier code de réduction ci-dessus."
        />
      ) : (
        <div className="ui-card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-canvas-border bg-canvas/60 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Réduction</th>
                <th className="px-4 py-3">Validité</th>
                <th className="px-4 py-3">Utilisations</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-canvas-border last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-ink">{coupon.code}</span>
                    {coupon.description ? (
                      <p className="text-xs text-ink-muted">{coupon.description}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-semibold text-action-700">
                    {formatDiscount(coupon.discountType, coupon.discountValue, coupon.currency)}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {formatWindow(coupon.startsAt, coupon.endsAt)}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {coupon.redeemedCount}
                    {coupon.maxRedemptions != null ? ` / ${coupon.maxRedemptions}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-soft px-2 py-1 text-xs font-semibold ${
                        coupon.isActive
                          ? "bg-progress-50 text-progress-700"
                          : "bg-canvas text-ink-muted"
                      }`}
                    >
                      {coupon.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={toggleCouponAction} className="inline">
                      <input type="hidden" name="id" value={coupon.id} />
                      <input type="hidden" name="isActive" value={coupon.isActive ? "false" : "true"} />
                      <button
                        type="submit"
                        className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                      >
                        {coupon.isActive ? "Désactiver" : "Activer"}
                      </button>
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
