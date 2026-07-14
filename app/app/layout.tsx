import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { logoutAction } from "@/server/actions/auth";
import { getAppName } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const metadata = {
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/app/tableau-de-bord", label: "Tableau de bord" },
  { href: "/app/catalogue", label: "Catalogue" },
  { href: "/app/mes-formations", label: "Mes formations" },
  { href: "/app/progression", label: "Progression" },
  { href: "/app/certificats", label: "Attestations" },
  { href: "/app/notes", label: "Notes" },
  { href: "/app/favoris", label: "Favoris" },
  { href: "/app/projets", label: "Exercices" },
  { href: "/app/abonnement", label: "Abonnement" },
  { href: "/app/paiements", label: "Paiements" },
  { href: "/app/support", label: "Support" },
  { href: "/app/profil", label: "Profil" },
];

export default async function LearnerAppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }

  const appName = getAppName();
  const display =
    session.profile?.displayName ??
    session.profile?.firstName ??
    session.user.email;

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/app/tableau-de-bord" className="font-display text-lg font-semibold text-brand-900">
            {appName}
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">{display}</span>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3">
          <nav aria-label="Navigation apprenant" className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-900"
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
