import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs",
};

export default function TarifsPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-slate-900">Tarifs</h1>
      <div className="mt-8 max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          Accès mensuel
        </p>
        <p className="mt-2 font-display text-4xl font-bold text-slate-900">
          2&nbsp;000 <span className="text-xl font-semibold">FCFA</span>
        </p>
        <p className="mt-2 text-sm text-slate-600">30 jours d&apos;accès à toutes les formations incluses.</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>· Parcours structurés</li>
          <li>· Exercices et suivi</li>
          <li>· Renouvellement manuel</li>
        </ul>
      </div>
    </section>
  );
}
