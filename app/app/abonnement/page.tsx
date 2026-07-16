import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, Crown, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
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

  const expiresLabel = subscription?.endsAt
    ? new Date(subscription.endsAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <section className="space-y-6">
      <PageHeader
        icon={Crown}
        title="Mon abonnement"
        subtitle="Gérez votre accès premium au catalogue de formations."
        tone="action"
      />

      {/* Bannière de statut. */}
      <div
        className={`ui-card overflow-hidden ${hasPremium ? "" : "border-action-200"}`}
      >
        <div
          className={
            hasPremium
              ? "bg-gradient-to-br from-brand-700 via-brand-600 to-action-500 p-6 text-white sm:p-8"
              : "bg-action-50/50 p-6 sm:p-8"
          }
        >
          <div className="flex items-center gap-2">
            {hasPremium ? (
              <BadgeCheck className="h-6 w-6" strokeWidth={2} aria-hidden />
            ) : (
              <Sparkles className="h-6 w-6 text-action-600" strokeWidth={2} aria-hidden />
            )}
            <span
              className={`text-sm font-bold uppercase tracking-wide ${hasPremium ? "text-white" : "text-action-700"}`}
            >
              {hasPremium ? "Accès premium actif" : "Aucun abonnement actif"}
            </span>
          </div>
          <p className={`mt-3 max-w-xl text-sm ${hasPremium ? "text-white/90" : "text-ink-muted"}`}>
            {hasPremium
              ? `Vous pouvez suivre toutes les formations du catalogue. Accès valable jusqu’au ${expiresLabel}.`
              : "Payez 2 000 FCFA pour 30 jours, puis choisissez une formation — elle s’installe dans Mes formations dès la première leçon."}
          </p>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div
              className={`rounded-soft p-4 ${hasPremium ? "bg-white/10 backdrop-blur-sm" : "bg-canvas-card"}`}
            >
              <dt className={`text-xs font-semibold uppercase tracking-wide ${hasPremium ? "text-white/80" : "text-ink-muted"}`}>
                Statut
              </dt>
              <dd className={`mt-1 text-sm font-semibold capitalize ${hasPremium ? "text-white" : "text-ink"}`}>
                {subscription?.status ?? "aucun"}
              </dd>
            </div>
            <div
              className={`rounded-soft p-4 ${hasPremium ? "bg-white/10 backdrop-blur-sm" : "bg-canvas-card"}`}
            >
              <dt className={`text-xs font-semibold uppercase tracking-wide ${hasPremium ? "text-white/80" : "text-ink-muted"}`}>
                Expiration
              </dt>
              <dd className={`mt-1 text-sm font-semibold ${hasPremium ? "text-white" : "text-ink"}`}>
                {expiresLabel}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Carte plan / paiement. */}
      {plan ? (
        <div className="ui-card p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {hasPremium ? "Renouveler l’accès" : "Activer l’accès"}
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-ink">
            {plan.priceAmount.toLocaleString("fr-FR")} {plan.currency}
            <span className="ml-1 text-sm font-normal text-ink-muted">
              / {plan.durationDays} jours
            </span>
          </p>
          <p className="mt-1 text-sm text-ink-muted">{plan.name}</p>
          <p className="mt-2 text-xs text-ink-muted">{checkout.hint}</p>

          <div className="mt-5 max-w-md space-y-3">
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

          {checkout.mode === "online" ? (
            <p className="mt-4 text-sm text-ink-muted">
              Le paiement en ligne ne passe pas ?{" "}
              <Link href="/paiement/manuel" className="font-semibold text-brand-600 hover:underline">
                Payer via Mobile Money + WhatsApp
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="text-sm">
        <Link href="/app/catalogue" className="font-semibold text-brand-600 hover:underline">
          Explorer le catalogue
        </Link>
        {" · "}
        <Link href="/app/paiements" className="font-semibold text-brand-600 hover:underline">
          Historique des paiements
        </Link>
      </p>
    </section>
  );
}
