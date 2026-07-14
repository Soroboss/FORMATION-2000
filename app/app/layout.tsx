import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canAccessAdmin } from "@/lib/permissions/roles";
import { isLearnerPreviewActive } from "@/lib/auth/workspace";
import {
  exitLearnerWorkspaceAction,
  logoutAction,
} from "@/server/actions/auth";
import { BrandLogo } from "@/components/brand/logo";
import { LearnerNav } from "@/components/app/learner-nav";
import { Button } from "@/components/ui/button";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function LearnerAppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/app/tableau-de-bord");
  }

  const isAdmin = canAccessAdmin(session.roles);
  const preview = await isLearnerPreviewActive();

  // Compte administrateur : l’espace /app n’est accessible qu’en aperçu volontaire.
  if (isAdmin && !preview) {
    redirect("/admin/tableau-de-bord");
  }

  const display =
    session.profile?.displayName ??
    session.profile?.firstName ??
    session.user.email;

  return (
    <div className="min-h-screen bg-canvas">
      {isAdmin && preview ? (
        <div className="border-b border-amber-300 bg-amber-50">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
            <p className="text-xs font-medium text-amber-900 sm:text-sm">
              Mode aperçu apprenant — vous consultez l’espace formation (compte admin).
            </p>
            <form action={exitLearnerWorkspaceAction}>
              <button
                type="submit"
                className="rounded-brand bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Retour administration
              </button>
            </form>
          </div>
        </div>
      ) : null}
      <header className="sticky top-0 z-30 border-b border-canvas-border bg-white/90 backdrop-blur supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:h-16 sm:px-6">
          <BrandLogo href="/app/tableau-de-bord" className="min-w-0" />
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden max-w-[10rem] truncate text-sm text-ink-muted md:inline">
              {display}
            </span>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm" className="px-2 sm:px-3">
                <span className="sm:hidden">Sortir</span>
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 md:grid-cols-[220px_1fr]">
        <aside className="ui-card h-fit p-3 md:sticky md:top-20 md:self-start">
          <LearnerNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
