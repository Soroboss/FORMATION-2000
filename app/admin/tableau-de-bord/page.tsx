import Link from "next/link";
import {
  Users,
  Repeat,
  CreditCard,
  Wallet,
  BookOpen,
  FileEdit,
  ClipboardCheck,
  MessageCircle,
  LayoutDashboard,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { getDashboardStats } from "@/server/repositories/admin-stats";
import { AdminPageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

type Card = {
  label: string;
  value: string | number;
  href: string;
  icon: LucideIcon;
  tone: "brand" | "success" | "info" | "warning";
};

const TONE: Record<Card["tone"], string> = {
  brand: "bg-brand-50 text-brand-600",
  success: "bg-progress-50 text-progress-600",
  info: "bg-action-50 text-action-600",
  warning: "bg-action-50 text-action-700",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards: Card[] = [
    { label: "Membres", value: stats.members, href: "/admin/membres", icon: Users, tone: "brand" },
    {
      label: "Abonnements actifs",
      value: stats.activeSubscriptions,
      href: "/admin/abonnements",
      icon: Repeat,
      tone: "success",
    },
    {
      label: "Paiements confirmés",
      value: stats.confirmedPayments,
      href: "/admin/paiements",
      icon: CreditCard,
      tone: "info",
    },
    {
      label: "CA (XOF)",
      value: stats.revenueXof.toLocaleString("fr-FR"),
      href: "/admin/finances",
      icon: Wallet,
      tone: "success",
    },
    {
      label: "Formations publiées",
      value: stats.publishedCourses,
      href: "/admin/formations",
      icon: BookOpen,
      tone: "brand",
    },
    {
      label: "Brouillons",
      value: stats.draftCourses,
      href: "/admin/formations",
      icon: FileEdit,
      tone: "warning",
    },
    {
      label: "Exercices à revoir",
      value: stats.pendingSubmissions,
      href: "/admin/projets",
      icon: ClipboardCheck,
      tone: "warning",
    },
  ];

  return (
    <section className="space-y-6">
      <AdminPageHeader
        icon={LayoutDashboard}
        title="Administration Learnoon"
        description="Vue d'ensemble : membres, contenus, abonnements et paiements."
        actions={
          <>
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
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="ui-card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
          >
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-brand ${TONE[card.tone]}`}>
              <card.icon className="h-6 w-6" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {card.label}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">{card.value}</p>
            </div>
          </Link>
        ))}

        <Link
          href="/admin/paiements-manuels"
          className="ui-card group flex items-center justify-between gap-4 border-brand-200 bg-brand-50/40 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-brand bg-brand-600 text-white">
              <MessageCircle className="h-6 w-6" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Paiements WhatsApp
              </p>
              <p className="mt-1 font-display text-base font-bold text-ink">À vérifier</p>
            </div>
          </div>
          <ArrowRight
            className="h-5 w-5 text-brand-600 transition group-hover:translate-x-1"
            strokeWidth={2}
            aria-hidden
          />
        </Link>
      </div>
    </section>
  );
}
