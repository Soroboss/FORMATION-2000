import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getCheckoutCapability } from "@/lib/payments/checkout-mode";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";
import {
  getLatestSubscriptionForUser,
  getPlanById,
  listActivePlans,
} from "@/server/repositories/payments";
import { CheckoutButton } from "@/features/payments/checkout-button";

export default async function AbonnementPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }

  const [hasPremium, subscription, plans] = await Promise.all([
    canAccessPremiumContent(session.user.id),
    getLatestSubscriptionForUser(session.user.id),
    listActivePlans(),
  ]);

  const plan = subscription ? await getPlanById(subscription.planId) : plans[0];
  const checkout = getCheckoutCapability();
  const payLabel = hasPremium
    ? checkout.mode === "online"
      ? "Renouveler maintenant"
      : "Renouveler via WhatsApp"
    : checkout.label;

  return (
    <section className="space-y-6">
      <div className="ui-card p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-ink">Mon abonnement</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {hasPremium
            ? "Votre accès premium est actif. Vous pouvez suivre toutes les formations du catalogue."
            : "Aucun abonnement actif. Payez 2 000 FCFA pour 30 jours, puis choisissez une formation — elle s’installera dans Mes formations dès la première leçon."}
        </p>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-soft bg-brand-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-700">Statut</dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {subscription?.status ?? "aucun"}
            </dd>
          </div>
          <div className="rounded-soft bg-progress-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-progress-700">
              Expiration
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {subscription?.endsAt
                ? new Date(subscription.endsAt).toLocaleString("fr-FR")
                : "—"}
            </dd>
          </div>
        </dl>

        {plan ? (
          <div className="mt-6 max-w-md space-y-3">
            <p className="text-sm text-ink-muted">
              {hasPremium ? "Renouveler" : "Activer"} : {plan.name} —{" "}
              {plan.priceAmount.toLocaleString("fr-FR")} {plan.currency} / {plan.durationDays}{" "}
              jours
            </p>
            <p className="text-xs text-ink-muted">{checkout.hint}</p>
            {checkout.mode === "online" ? (
              <CheckoutButton planSlug={plan.slug} label={payLabel} />
            ) : (
              <Link
                href="/paiement/manuel"
                className="inline-flex h-12 w-full items-center justify-center rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                {payLabel}
              </Link>
            )}
            <Link
              href="/paiement"
              className="inline-flex h-11 w-full items-center justify-center rounded-brand border-2 border-brand-600 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              Page paiement complète
            </Link>
          </div>
        ) : null}

        {checkout.mode === "online" ? (
          <p className="mt-6 text-sm text-ink-muted">
            Le paiement en ligne ne passe pas ?{" "}
            <Link href="/paiement/manuel" className="font-semibold text-brand-600 hover:underline">
              Payer via Mobile Money + WhatsApp
            </Link>
          </p>
        ) : null}
        <p className="mt-2 text-sm">
          <Link href="/app/catalogue" className="font-semibold text-brand-600 hover:underline">
            Explorer le catalogue
          </Link>
          {" · "}
          <Link href="/app/paiements" className="font-semibold text-brand-600 hover:underline">
            Historique des paiements
          </Link>
        </p>
      </div>
    </section>
  );
}
