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
      <header className="sticky top-0 z-30 border-b border-canvas-border bg-slate-950 text-white supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin/tableau-de-bord"
              className="flex min-w-0 items-center gap-2.5"
              aria-label="Learnoon Academy Administration"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/icon-512.png"
                alt=""
                className="h-8 w-8 shrink-0 rounded-soft object-contain sm:h-9 sm:w-9"
              />
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="font-display text-base font-bold tracking-tight text-white">
                  Learnoon
                </span>
                <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 min-[380px]:inline">
                  Administration
                </span>
              </span>
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden max-w-[9rem] truncate text-sm text-white/70 md:inline">
              {display}
            </span>
            <form action={enterLearnerWorkspaceAction} className="hidden sm:block">
              <button
                type="submit"
                className="text-sm font-medium text-white/70 underline-offset-2 hover:text-white hover:underline"
              >
                Aperçu apprenant
              </button>
            </form>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="px-2 text-white hover:bg-white/10 hover:text-white sm:px-3"
              >
                <span className="sm:hidden">Sortir</span>
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 md:grid-cols-[220px_1fr]">
        <aside className="ui-card h-fit p-3 md:sticky md:top-20 md:self-start">
          <AdminNav />
          <form
            action={enterLearnerWorkspaceAction}
            className="mt-3 border-t border-canvas-border pt-3 sm:hidden"
          >
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
