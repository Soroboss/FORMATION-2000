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
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-600">Vue d&apos;ensemble opérationnelle.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-slate-900">{card.value}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
