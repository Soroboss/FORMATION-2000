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
          <dt className="font-semibold">Possédez-vous les vidéos des formations ?</dt>
          <dd className="mt-1">
            Non. Nous proposons la curation, la structure pédagogique, les exercices et le suivi —
            la valeur est dans le parcours organisé, pas dans la propriété des contenus vidéo.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Que se passe-t-il après le paiement ?</dt>
          <dd className="mt-1">
            Votre accès premium est activé pour 30 jours. Vous pouvez alors suivre toutes les
            formations incluses dans le catalogue.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Le paiement Mobile Money est-il possible ?</dt>
          <dd className="mt-1">
            Oui. Si le paiement en ligne ne passe pas, utilisez Mobile Money puis envoyez la
            capture via WhatsApp pour confirmation manuelle.
          </dd>
        </div>
      </dl>
    </section>
  );
}
