import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";
import {
  getLatestSubscriptionForUser,
  getPlanById,
  listActivePlans,
} from "@/server/repositories/payments";
import { CheckoutButton } from "@/features/payments/checkout-button";

export default async function AbonnementPage() {
  const session = await getSession();
  if (!session) return null;

  const [hasPremium, subscription, plans] = await Promise.all([
    canAccessPremiumContent(session.user.id),
    getLatestSubscriptionForUser(session.user.id),
    listActivePlans(),
  ]);

  const plan = subscription ? await getPlanById(subscription.planId) : plans[0];

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-slate-900">Mon abonnement</h1>
        <p className="mt-2 text-sm text-slate-600">
          {hasPremium
            ? "Votre accès premium est actif."
            : "Aucun abonnement actif. Les leçons premium restent verrouillées."}
        </p>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-brand-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-700">Statut</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {subscription?.status ?? "aucun"}
            </dd>
          </div>
          <div className="rounded-xl bg-progress-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-progress-700">
              Expiration
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {subscription?.endsAt
                ? new Date(subscription.endsAt).toLocaleString("fr-FR")
                : "—"}
            </dd>
          </div>
        </dl>

        {plan ? (
          <div className="mt-6 max-w-md">
            <p className="mb-3 text-sm text-slate-600">
              {hasPremium ? "Renouveler" : "Activer"} : {plan.name} —{" "}
              {plan.priceAmount.toLocaleString("fr-FR")} {plan.currency} / {plan.durationDays} jours
            </p>
            <CheckoutButton
              planSlug={plan.slug}
              label={hasPremium ? "Renouveler maintenant" : "Payer 2 000 FCFA"}
            />
          </div>
        ) : null}

        <p className="mt-4 text-sm text-slate-600">
          Le paiement en ligne ne passe pas ?{" "}
          <Link href="/paiement/manuel" className="font-semibold text-brand-700 hover:underline">
            Payer via Mobile Money + WhatsApp
          </Link>
        </p>
        <p className="mt-2 text-sm">
          <Link href="/app/paiements" className="font-semibold text-brand-700 hover:underline">
            Voir l&apos;historique des paiements
          </Link>
        </p>
      </div>
    </section>
  );
}
