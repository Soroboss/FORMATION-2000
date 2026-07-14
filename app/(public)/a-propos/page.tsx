import type { Metadata } from "next";

export const metadata: Metadata = { title: "À propos" };

export default function Page() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-slate-900">À propos</h1>
      <p className="mt-4 text-slate-700">
        Académie 2000 rend la formation accessible via un abonnement mensuel simple, avec des
        parcours curés et structurés pour l&apos;Afrique francophone.
      </p>
    </section>
  );
}
