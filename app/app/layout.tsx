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
      <header className="border-b border-canvas-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLogo href="/app/tableau-de-bord" />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-muted sm:inline">{display}</span>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="ui-card h-fit p-3">
          <LearnerNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
