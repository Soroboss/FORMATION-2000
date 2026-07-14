import type { Metadata } from "next";

export const metadata: Metadata = { title: "Comment ça marche" };

export default function CommentCaMarchePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-slate-900">Comment ça marche</h1>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-slate-700">
        <li>Créez un compte.</li>
        <li>Payez 2 000 FCFA pour 30 jours (Phase 3).</li>
        <li>Suivez les leçons, pratiquez, validez votre progression.</li>
      </ol>
    </section>
  );
}
