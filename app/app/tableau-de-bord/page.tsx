import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";
import { getLatestSubscriptionForUser } from "@/server/repositories/payments";

export default async function TableauDeBordPage() {
  const session = await getSession();
  const name =
    session?.profile?.firstName ??
    session?.profile?.displayName ??
    session?.user.email ??
    "apprenant";

  const hasPremium = session ? await canAccessPremiumContent(session.user.id) : false;
  const subscription = session
    ? await getLatestSubscriptionForUser(session.user.id)
    : null;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-slate-900">
          Bienvenue sur Learnoon Academy
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Bonjour, {name}.{" "}
          {hasPremium
            ? "Votre abonnement est actif. Continuez une formation ou explorez le catalogue."
            : "Activez l'accès mensuel pour débloquer les leçons premium."}
        </p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-brand-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Rôles
            </dt>
            <dd className="mt-1 text-sm font-medium text-brand-950">
              {session?.roles.join(", ") ?? "learner"}
            </dd>
          </div>
          <div className="rounded-xl bg-progress-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-progress-700">
              Abonnement
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">
              {hasPremium ? "Actif" : subscription?.status ?? "Inactif"}
            </dd>
          </div>
          <div className="rounded-xl bg-action-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-action-700">
              Expiration
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">
              {subscription?.endsAt
                ? new Date(subscription.endsAt).toLocaleDateString("fr-FR")
                : "—"}
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={hasPremium ? "/app/catalogue" : "/app/abonnement"}
            className="inline-flex h-11 items-center rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {hasPremium ? "Continuer" : "S'abonner — 2 000 FCFA"}
          </Link>
          <Link
            href="/app/mes-formations"
            className="inline-flex h-11 items-center rounded-lg border border-brand-200 px-5 text-sm font-semibold text-brand-900 hover:bg-brand-50"
          >
            Mes formations
          </Link>
          <Link
            href="/app/progression"
            className="inline-flex h-11 items-center rounded-lg border border-brand-200 px-5 text-sm font-semibold text-brand-900 hover:bg-brand-50"
          >
            Progression
          </Link>
          {hasPremium ? (
            <Link
              href="/app/abonnement"
              className="inline-flex h-11 items-center rounded-lg border border-brand-200 px-5 text-sm font-semibold text-brand-900 hover:bg-brand-50"
            >
              Renouveler
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
