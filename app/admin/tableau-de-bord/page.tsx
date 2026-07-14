import Link from "next/link";
import { getDashboardStats } from "@/server/repositories/admin-stats";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Membres", value: stats.members, href: "/admin/membres" },
    {
      label: "Abonnements actifs",
      value: stats.activeSubscriptions,
      href: "/admin/abonnements",
    },
    {
      label: "Paiements confirmés",
      value: stats.confirmedPayments,
      href: "/admin/paiements",
    },
    {
      label: "CA (XOF)",
      value: stats.revenueXof.toLocaleString("fr-FR"),
      href: "/admin/paiements",
    },
    {
      label: "Formations publiées",
      value: stats.publishedCourses,
      href: "/admin/formations",
    },
    {
      label: "Brouillons",
      value: stats.draftCourses,
      href: "/admin/formations",
    },
    {
      label: "Exercices à revoir",
      value: stats.pendingSubmissions,
      href: "/admin/projets",
    },
    {
      label: "Paiements WhatsApp",
      value: "→",
      href: "/admin/paiements-manuels",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="ui-card p-5 sm:p-6">
        <h1 className="font-display text-2xl font-bold text-ink">
          Administration Learnoon
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Vue d&apos;ensemble : membres, contenus, abonnements et paiements.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/formations/nouvelle"
            className="inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Nouvelle formation
          </Link>
          <Link
            href="/admin/paiements-manuels"
            className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
          >
            Valider paiements WhatsApp
          </Link>
          <Link
            href="/admin/membres"
            className="inline-flex h-10 items-center rounded-brand border border-canvas-border px-4 text-sm font-semibold text-ink hover:bg-canvas"
          >
            Gérer les membres
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="ui-card p-5 transition hover:border-brand-200 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {card.label}
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-ink">{card.value}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
