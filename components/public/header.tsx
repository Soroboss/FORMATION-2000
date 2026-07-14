import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";
import { getSession } from "@/lib/auth/session";
import { defaultHomeForRoles } from "@/lib/permissions/roles";
import { logoutAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/public/mobile-nav";

export async function PublicHeader() {
  const session = await getSession();
  const homeHref = session ? defaultHomeForRoles(session.roles) : "/connexion";
  const homeLabel =
    session && homeHref.startsWith("/admin") ? "Administration" : "Mon espace";

  return (
    <header className="relative border-b border-white/40 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandLogo />
        <nav aria-label="Navigation principale" className="hidden items-center gap-2 sm:flex sm:gap-3">
          <Link
            href="/formations"
            className="text-sm font-medium text-slate-700 hover:text-brand-800"
          >
            Formations
          </Link>
          <Link
            href="/categories"
            className="hidden text-sm font-medium text-slate-700 hover:text-brand-800 md:inline"
          >
            Catégories
          </Link>
          <Link
            href="/tarifs"
            className="text-sm font-medium text-slate-700 hover:text-brand-800"
          >
            Tarifs
          </Link>
          {session ? (
            <>
              <Link
                href={homeHref}
                className="inline-flex h-10 min-h-10 items-center rounded-lg border border-brand-200 bg-white px-3 text-sm font-semibold text-brand-900 hover:bg-brand-50"
              >
                {homeLabel}
              </Link>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  Déconnexion
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="inline-flex h-10 min-h-10 items-center px-3 text-sm font-semibold text-brand-800 hover:bg-brand-50"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="inline-flex h-10 min-h-10 items-center rounded-lg bg-brand-600 px-3 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Commencer
              </Link>
            </>
          )}
        </nav>
        <MobileNav
          isAuthenticated={Boolean(session)}
          homeHref={homeHref}
          homeLabel={homeLabel}
        />
      </div>
    </header>
  );
}
