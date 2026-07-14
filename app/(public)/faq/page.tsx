import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

export default function Page() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-slate-900">FAQ</h1>
      <dl className="mt-6 space-y-4 text-slate-700">
        <div>
          <dt className="font-semibold">Combien coûte l&apos;accès ?</dt>
          <dd className="mt-1">2 000 FCFA pour 30 jours.</dd>
        </div>
        <div>
          <dt className="font-semibold">Possédez-vous les vidéos YouTube ?</dt>
          <dd className="mt-1">
            Non. Nous vendons la curation, la structure pédagogique et le suivi.
          </dd>
        </div>
      </dl>
    </section>
  );
}
