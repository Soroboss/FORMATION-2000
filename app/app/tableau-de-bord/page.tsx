import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  Compass,
  CreditCard,
  Lock,
  PlayCircle,
  Shield,
  TrendingUp,
} from "lucide-react";
import { CategoryCard } from "@/components/learning/category-card";
import { getSession } from "@/lib/auth/session";
import { canAccessAdmin } from "@/lib/permissions/roles";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";
import { listCategories } from "@/server/repositories/catalog";
import { listEnrollmentsForUser } from "@/server/repositories/learning";
import { getLatestSubscriptionForUser } from "@/server/repositories/payments";

export default async function TableauDeBordPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }

  const name =
    session.profile?.firstName ??
    session.profile?.displayName ??
    session.user.email ??
    "apprenant";

  const [hasPremium, subscription, enrollments, categories] = await Promise.all([
    canAccessPremiumContent(session.user.id),
    getLatestSubscriptionForUser(session.user.id),
    listEnrollmentsForUser(session.user.id),
    listCategories(),
  ]);

  const hasCourses = enrollments.length > 0;
  const isAdmin = canAccessAdmin(session.roles);

  return (
    <section className="space-y-6">
      <div className="ui-card p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Bienvenue sur Learnoon Academy
        </h1>
        <p className="mt-2 text-sm text-ink-muted sm:text-base">
          Bonjour, <span className="font-semibold text-ink">{name}</span>.{" "}
          {hasPremium
            ? hasCourses
              ? "Reprenez là où vous vous êtes arrêté, ou explorez une nouvelle catégorie."
              : "Votre accès premium est actif. Choisissez une formation pour commencer."
            : "Pour regarder les leçons premium, activez l’abonnement puis choisissez une formation."}
        </p>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-soft bg-brand-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Rôles
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {session.roles.join(", ") || "learner"}
            </dd>
          </div>
          <div className="rounded-soft bg-progress-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-progress-700">
              Abonnement
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {hasPremium ? "Actif" : subscription?.status ?? "Inactif"}
            </dd>
          </div>
          <div className="rounded-soft bg-action-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-action-700">
              Expiration
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {subscription?.endsAt
                ? new Date(subscription.endsAt).toLocaleDateString("fr-FR")
                : "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          {!hasPremium ? (
            <>
              <Link
                href="/paiement"
                className="inline-flex h-11 items-center gap-2 rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <CreditCard className="h-4 w-4" strokeWidth={2} aria-hidden />
                S&apos;abonner — 2 000 FCFA
              </Link>
              <Link
                href="/paiement/manuel"
                className="inline-flex h-11 items-center rounded-brand border-2 border-brand-600 px-5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
              >
                Payer via WhatsApp
              </Link>
            </>
          ) : (
            <Link
              href="/app/catalogue"
              className="inline-flex h-11 items-center gap-2 rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <PlayCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
              {hasCourses ? "Continuer" : "Choisir une formation"}
            </Link>
          )}
          <Link
            href="/app/catalogue"
            className="inline-flex h-11 items-center gap-2 rounded-brand border-2 border-brand-600 px-5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
          >
            <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
            Catalogue & catégories
          </Link>
          {hasCourses ? (
            <Link
              href="/app/mes-formations"
              className="inline-flex h-11 items-center gap-2 rounded-brand border-2 border-brand-600 px-5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              <BookOpen className="h-4 w-4" strokeWidth={2} aria-hidden />
              Mes formations
            </Link>
          ) : null}
          {isAdmin ? (
            <Link
              href="/admin/tableau-de-bord"
              className="inline-flex h-11 items-center gap-2 rounded-brand bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Shield className="h-4 w-4" strokeWidth={2} aria-hidden />
              Administration
            </Link>
          ) : null}
        </div>
      </div>

      {!hasPremium ? (
        <div className="ui-card border-action-200 bg-action-50/40 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-soft bg-action-500 text-white">
              <Lock className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                Parcours recommandé
              </h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-muted">
                <li>
                  Explorez les{" "}
                  <Link href="/app/catalogue" className="font-semibold text-brand-600 underline">
                    catégories et formations
                  </Link>
                  .
                </li>
                <li>
                  Activez l&apos;accès premium pour{" "}
                  <strong className="text-ink">2&nbsp;000&nbsp;FCFA / 30 jours</strong>.
                </li>
                <li>
                  La formation s&apos;installe dans{" "}
                  <Link href="/app/mes-formations" className="font-semibold text-brand-600 underline">
                    Mes formations
                  </Link>{" "}
                  dès que vous commencez une leçon — vous pouvez regarder et progresser.
                </li>
              </ol>
            </div>
          </div>
        </div>
      ) : null}

      {!hasCourses ? (
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">
                Commencez par une catégorie
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Aucune formation dans votre espace pour l&apos;instant. Choisissez un domaine.
              </p>
            </div>
            <Link
              href="/app/catalogue"
              className="hidden text-sm font-semibold text-brand-600 hover:underline sm:inline"
            >
              Tout voir
            </Link>
          </div>
          {categories.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {categories.slice(0, 6).map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  hrefBase="/app/categories"
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p className="ui-card p-5 text-sm text-ink-muted">
              Les catégories seront bientôt disponibles.{" "}
              <Link href="/app/catalogue" className="font-semibold text-brand-600 underline">
                Voir le catalogue
              </Link>
            </p>
          )}
        </div>
      ) : (
        <div className="ui-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-progress-600" strokeWidth={2} aria-hidden />
            <h2 className="font-display text-lg font-semibold text-ink">
              Vos formations en cours
            </h2>
          </div>
          <p className="mt-2 text-sm text-ink-muted">
            Vous suivez {enrollments.length} formation
            {enrollments.length > 1 ? "s" : ""}.
          </p>
          <Link
            href="/app/mes-formations"
            className="mt-4 inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Ouvrir mes formations
          </Link>
        </div>
      )}
    </section>
  );
}
