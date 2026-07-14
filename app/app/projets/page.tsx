import Link from "next/link";
import { getSession } from "@/lib/auth/session";

export default async function ProjetsPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <section className="space-y-6">
      <div className="ui-card p-5 sm:p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Exercices & projets</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Soumettez vos exercices depuis chaque leçon qui en propose un.
        </p>
      </div>

      <div className="ui-card border-dashed p-6 text-center">
        <p className="font-display font-semibold text-ink">Où déposer un livrable ?</p>
        <p className="mt-2 text-sm text-ink-muted">
          Ouvrez une formation, puis une leçon avec exercice (par ex. aperçu HTML) pour déposer
          votre travail.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/app/catalogue"
            className="inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Catalogue
          </Link>
          <Link
            href="/app/mes-formations"
            className="inline-flex h-10 items-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
          >
            Mes formations
          </Link>
        </div>
      </div>
    </section>
  );
}
