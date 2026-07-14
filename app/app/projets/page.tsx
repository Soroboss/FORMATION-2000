import { getSession } from "@/lib/auth/session";

export default async function ProjetsPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <section className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-slate-900">Exercices & projets</h1>
      <p className="text-sm text-slate-600">
        Soumettez vos exercices depuis chaque leçon. La correction détaillée arrivera avec le
        back-office (Phase 5).
      </p>
      <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
        Ouvrez une leçon avec exercice (ex. aperçu « Introduction au HTML ») pour déposer un
        livrable.
      </p>
    </section>
  );
}
