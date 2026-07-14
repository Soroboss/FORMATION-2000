import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Abonnement Learnoon Academy : 2 000 FCFA pour 30 jours d’accès premium à toutes les formations.",
};

const included = [
  "Accès à tout le catalogue premium pendant 30 jours",
  "Parcours structurés (débutant → expert)",
  "Lecteur vidéo intégré + crédits créateurs",
  "Exercices pratiques et missions concrètes",
  "Suivi de progression, notes et favoris",
  "Attestations internes de réussite",
  "Support et assistance",
  "Paiement Mobile Money / WhatsApp si besoin",
];

const freeVsPremium = [
  { label: "Catalogue public (aperçus)", free: true, premium: true },
  { label: "Leçons premium complètes", free: false, premium: true },
  { label: "Exercices & projets", free: false, premium: true },
  { label: "Suivi de progression", free: false, premium: true },
  { label: "Attestations internes", free: false, premium: true },
  { label: "Support prioritaire", free: false, premium: true },
];

const faqs = [
  {
    q: "L’abonnement se renouvelle-t-il automatiquement ?",
    a: "Non. Le renouvellement est manuel : vous choisissez quand prolonger vos 30 jours.",
  },
  {
    q: "Que se passe-t-il si le paiement en ligne échoue ?",
    a: "Utilisez Mobile Money, envoyez la capture via WhatsApp, et un administrateur active votre accès après confirmation.",
  },
  {
    q: "Puis-je accéder à toutes les formations ?",
    a: "Oui. L’abonnement donne accès à l’ensemble du catalogue inclus pendant la durée active.",
  },
];

export default function TarifsPage() {
  return (
    <>
      <section className="border-b border-canvas-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="animate-fade-up text-sm font-semibold uppercase tracking-wide text-brand-600">
            Tarifs
          </p>
          <h1 className="animate-fade-up mt-2 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Un prix simple. Un accès premium.
          </h1>
          <p className="animate-fade-up-delay-1 mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Learnoon Academy rend la formation accessible :{" "}
            <strong className="font-semibold text-ink">2&nbsp;000&nbsp;FCFA</strong> pour{" "}
            <strong className="font-semibold text-ink">30 jours</strong> d&apos;accès à toutes les
            formations incluses. Sans engagement caché.
          </p>
        </div>
      </section>

      <section className="bg-canvas py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Offre principale */}
          <article className="relative overflow-hidden rounded-card border-2 border-brand-600 bg-white p-6 shadow-card sm:p-8">
            <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-action-500 px-3 py-1 text-xs font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Recommandé
            </div>

            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Accès mensuel premium
            </p>
            <div className="mt-3 flex items-end gap-2">
              <p className="font-display text-5xl font-bold tracking-tight text-ink sm:text-6xl">
                2&nbsp;000
              </p>
              <p className="mb-2 text-lg font-semibold text-ink-muted">FCFA</p>
            </div>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-ink-muted">
              <Clock className="h-4 w-4 text-brand-600" strokeWidth={2} aria-hidden />
              30 jours d&apos;accès · renouvellement manuel
            </p>

            <ul className="mt-8 space-y-3">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-progress-500"
                    strokeWidth={2}
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/inscription"
                className="inline-flex h-12 flex-1 items-center justify-center rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Commencer maintenant →
              </Link>
              <Link
                href="/paiement"
                className="inline-flex h-12 flex-1 items-center justify-center rounded-brand border-2 border-brand-600 bg-transparent px-5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
              >
                Payer l&apos;abonnement
              </Link>
            </div>
          </article>

          {/* Comparatif + paiements */}
          <div className="space-y-6">
            <div className="ui-card overflow-hidden">
              <div className="border-b border-canvas-border bg-white px-5 py-4">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Gratuit vs Premium
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Voyez clairement ce que débloque l&apos;abonnement.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-canvas-border bg-canvas text-ink-muted">
                      <th className="px-5 py-3 font-medium">Fonctionnalité</th>
                      <th className="px-3 py-3 text-center font-medium">Gratuit</th>
                      <th className="px-3 py-3 text-center font-medium text-brand-700">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {freeVsPremium.map((row) => (
                      <tr key={row.label} className="border-b border-canvas-border last:border-0">
                        <td className="px-5 py-3 text-ink">{row.label}</td>
                        <td className="px-3 py-3 text-center">
                          {row.free ? (
                            <CheckCircle2
                              className="mx-auto h-4 w-4 text-progress-500"
                              strokeWidth={2}
                              aria-label="Inclus"
                            />
                          ) : (
                            <X
                              className="mx-auto h-4 w-4 text-slate-300"
                              strokeWidth={2}
                              aria-label="Non inclus"
                            />
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {row.premium ? (
                            <CheckCircle2
                              className="mx-auto h-4 w-4 text-brand-600"
                              strokeWidth={2}
                              aria-label="Inclus"
                            />
                          ) : (
                            <X
                              className="mx-auto h-4 w-4 text-slate-300"
                              strokeWidth={2}
                              aria-label="Non inclus"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="ui-card space-y-4 p-5">
              <h2 className="font-display text-lg font-semibold text-ink">Moyens de paiement</h2>
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-soft bg-brand-50 text-brand-600">
                  <CreditCard className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Paiement en ligne</p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    Activation automatique après confirmation sécurisée.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-soft bg-progress-50 text-progress-600">
                  <MessageCircle className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Mobile Money + WhatsApp</p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    Idéal si le paiement en ligne ne passe pas.{" "}
                    <Link href="/paiement/manuel" className="font-semibold text-brand-600 underline">
                      Voir la procédure
                    </Link>
                    .
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-soft bg-action-50 text-action-600">
                  <ShieldCheck className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Accès après confirmation</p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    Jamais d&apos;activation premium sans validation du paiement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-canvas-border bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-ink">Questions fréquentes</h2>
          <dl className="mt-8 space-y-6">
            {faqs.map((item) => (
              <div key={item.q}>
                <dt className="font-display text-base font-semibold text-ink">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm text-ink-muted">
            Plus de détails dans la{" "}
            <Link href="/faq" className="font-semibold text-brand-600 underline">
              FAQ
            </Link>{" "}
            ou sur la page{" "}
            <Link href="/contact" className="font-semibold text-brand-600 underline">
              Contact
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="bg-brand-600 py-12 text-white sm:py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Chaque compétence ouvre une nouvelle opportunité.
          </h2>
          <p className="mt-3 text-white/90">
            Activez Learnoon Academy aujourd&apos;hui — 2&nbsp;000&nbsp;FCFA pour 30 jours.
          </p>
          <Link
            href="/inscription"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-brand bg-white px-8 text-base font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Créer mon compte →
          </Link>
        </div>
      </section>
    </>
  );
}
