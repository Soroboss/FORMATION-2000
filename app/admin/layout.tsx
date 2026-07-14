import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canAccessAdmin } from "@/lib/permissions/roles";
import {
  enterLearnerWorkspaceAction,
  logoutAction,
} from "@/server/actions/auth";
import { AdminNav } from "@/components/app/admin-nav";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/admin/tableau-de-bord");
  }
  if (!canAccessAdmin(session.roles)) {
    redirect("/app/tableau-de-bord");
  }

  const display =
    session.profile?.displayName ??
    session.profile?.firstName ??
    session.user.email;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-canvas-border bg-slate-950 text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/tableau-de-bord"
              className="flex items-center gap-2.5"
              aria-label="Learnoon Academy Administration"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/icon-512.png" alt="" className="h-9 w-9 rounded-soft object-contain" />
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="font-display text-base font-bold tracking-tight text-white">
                  Learnoon
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  Administration
                </span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-white/70 sm:inline">{display}</span>
            <form action={enterLearnerWorkspaceAction}>
              <button
                type="submit"
                className="hidden text-sm font-medium text-white/70 underline-offset-2 hover:text-white hover:underline sm:inline"
              >
                Aperçu espace apprenant
              </button>
            </form>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="ui-card h-fit p-3">
          <AdminNav />
          <form action={enterLearnerWorkspaceAction} className="mt-3 border-t border-canvas-border pt-3 sm:hidden">
            <Button type="submit" variant="outline" size="sm" className="w-full">
              Aperçu apprenant
            </Button>
          </form>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
