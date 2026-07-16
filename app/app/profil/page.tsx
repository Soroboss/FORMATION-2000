import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, Compass, CreditCard, LifeBuoy, Mail, Phone, ShieldCheck, UserCircle } from "lucide-react";
import { ProfileEditForm } from "@/components/app/profile-edit-form";
import { PageHeader } from "@/components/app/page-header";
import { getSession } from "@/lib/auth/session";
import { canAccessPremiumContent } from "@/lib/subscriptions/access";
import { getLatestSubscriptionForUser } from "@/server/repositories/payments";

function initials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

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
      session.user.email ||
      "Apprenant");
  const email = session.profile?.email ?? session.user.email ?? "—";
  const phone = session.profile?.phone ?? "—";

  return (
    <section className="space-y-6">
      <PageHeader
        icon={UserCircle}
        title="Profil"
        subtitle="Vos informations personnelles. L’e-mail et l’abonnement se gèrent séparément."
      />

      {/* Carte identité. */}
      <div className="ui-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-action-500 text-xl font-bold text-white">
          {initials(displayName ?? "?")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold text-ink">{displayName}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-muted">
            <Mail className="h-4 w-4" strokeWidth={2} aria-hidden />
            {email}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-semibold ${
            hasPremium ? "bg-progress-50 text-progress-700" : "bg-canvas text-ink-muted"
          }`}
        >
          <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          {hasPremium
            ? `Premium${subscription?.endsAt ? ` · ${new Date(subscription.endsAt).toLocaleDateString("fr-FR")}` : ""}`
            : "Accès inactif"}
        </span>
      </div>

      {/* Édition du profil. */}
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

      {/* Détails compte. */}
      <div className="ui-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Détails du compte
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 text-ink-muted" strokeWidth={2} aria-hidden />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Téléphone
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-ink">{phone}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-ink-muted" strokeWidth={2} aria-hidden />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Rôles
              </dt>
              <dd className="mt-0.5 text-sm font-medium capitalize text-ink">
                {session.roles.join(", ") || "learner"}
              </dd>
            </div>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/app/abonnement"
            className="inline-flex h-10 items-center gap-2 rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <CreditCard className="h-4 w-4" strokeWidth={2} aria-hidden />
            Gérer l&apos;abonnement
          </Link>
          <Link
            href="/app/catalogue"
            className="inline-flex h-10 items-center gap-2 rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
          >
            <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
            Catalogue
          </Link>
          <Link
            href="/app/support"
            className="inline-flex h-10 items-center gap-2 rounded-brand border border-canvas-border px-4 text-sm font-semibold text-ink hover:bg-canvas"
          >
            <LifeBuoy className="h-4 w-4" strokeWidth={2} aria-hidden />
            Support
          </Link>
        </div>
      </div>
    </section>
  );
}
