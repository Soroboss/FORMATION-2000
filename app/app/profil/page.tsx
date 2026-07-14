import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/app/profile-edit-form";
import { getSession } from "@/lib/auth/session";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";
import { getLatestSubscriptionForUser } from "@/server/repositories/payments";

export default async function ProfilPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }

  const [hasPremium, subscription] = await Promise.all([
    canAccessPremiumContent(session.user.id),
    getLatestSubscriptionForUser(session.user.id),
  ]);

  const firstName = session.profile?.firstName ?? "—";
  const lastName = session.profile?.lastName ?? "—";
  const displayName =
    session.profile?.displayName ??
    ([session.profile?.firstName, session.profile?.lastName].filter(Boolean).join(" ") ||
      session.user.email);
  const email = session.profile?.email ?? session.user.email ?? "—";
  const phone = session.profile?.phone ?? "—";

  return (
    <section className="space-y-6">
      <div className="ui-card p-5 sm:p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Profil</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Mettez à jour vos informations personnelles. L&apos;e-mail et l&apos;abonnement se
          gèrent ailleurs.
        </p>
      </div>

      <div className="ui-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Modifier le profil
        </h2>
        <div className="mt-4">
          <ProfileEditForm
            firstName={firstName}
            lastName={lastName}
            displayName={displayName ?? ""}
            phone={phone}
          />
        </div>
      </div>

      <div className="ui-card p-5 sm:p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              E-mail
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink">{email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Rôles</dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {session.roles.join(", ") || "learner"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Abonnement
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {hasPremium
                ? `Actif${subscription?.endsAt ? ` jusqu’au ${new Date(subscription.endsAt).toLocaleDateString("fr-FR")}` : ""}`
                : "Inactif"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/app/abonnement"
            className="inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Gérer l&apos;abonnement
          </Link>
          <Link
            href="/app/catalogue"
            className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
          >
            Catalogue
          </Link>
          <Link
            href="/app/support"
            className="inline-flex h-10 items-center rounded-brand border border-canvas-border px-4 text-sm font-semibold text-ink hover:bg-canvas"
          >
            Support
          </Link>
        </div>
      </div>
    </section>
  );
}
