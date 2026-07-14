import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canAccessAdmin } from "@/lib/permissions/roles";
import { logoutAction } from "@/server/actions/auth";
import { getAppName } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin/tableau-de-bord", label: "Vue d'ensemble" },
  { href: "/admin/formations", label: "Formations" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/membres", label: "Membres" },
  { href: "/admin/abonnements", label: "Abonnements" },
  { href: "/admin/paiements", label: "Paiements" },
  { href: "/admin/paiements-manuels", label: "Paiements WhatsApp" },
  { href: "/admin/projets", label: "Exercices" },
  { href: "/admin/journaux", label: "Audit" },
  { href: "/admin/parametres", label: "Paramètres" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/admin/tableau-de-bord");
  }
  if (!canAccessAdmin(session.roles)) {
    redirect("/app/tableau-de-bord");
  }

  const appName = getAppName();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/admin/tableau-de-bord" className="text-sm font-semibold tracking-wide">
            {appName} · Admin
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm" className="text-white hover:bg-white/10">
              Déconnexion
            </Button>
          </form>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3">
          <nav aria-label="Navigation administration" className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
