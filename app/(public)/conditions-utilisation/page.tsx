import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Conditions d'utilisation" };

export default function ConditionsPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink">Conditions d&apos;utilisation</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Learnoon Academy — dernière mise à jour : juillet 2026
      </p>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-ink">
        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">1. Objet</h2>
          <p className="text-ink-muted">
            Les présentes Conditions d&apos;utilisation régissent l&apos;accès et l&apos;usage de la
            plateforme Learnoon Academy, service de formation en ligne par abonnement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">2. Compte utilisateur</h2>
          <p className="text-ink-muted">
            Vous devez fournir des informations exactes (identité, e-mail, numéro WhatsApp) lors de
            l&apos;inscription. Vous êtes responsable de la confidentialité de vos identifiants.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">3. Abonnement et accès</h2>
          <p className="text-ink-muted">
            L&apos;abonnement donne un accès temporaire aux contenus pédagogiques de la plateforme.
            Il ne confère aucun droit de propriété sur les vidéos ou ressources intégrées, qui
            restent la propriété de leurs auteurs et plateformes d&apos;origine respectifs.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">4. Paiements</h2>
          <p className="text-ink-muted">
            Les paiements peuvent être effectués via les moyens proposés sur la plateforme (y
            compris Mobile Money avec confirmation manuelle). Un accès premium n&apos;est activé
            qu&apos;après confirmation du paiement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">5. Comportement</h2>
          <p className="text-ink-muted">
            Tout usage abusif, partage non autorisé de compte, ou tentative de contournement des
            contrôles d&apos;accès peut entraîner la suspension du compte.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">6. Données personnelles</h2>
          <p className="text-ink-muted">
            Le traitement de vos données est décrit dans la{" "}
            <Link href="/politique-confidentialite" className="font-semibold text-brand-600 underline">
              Politique de confidentialité
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">7. Contact</h2>
          <p className="text-ink-muted">
            Pour toute question relative aux présentes conditions, contactez Learnoon Academy via
            les canaux indiqués sur la page{" "}
            <Link href="/contact" className="font-semibold text-brand-600 underline">
              Contact
            </Link>
            .
          </p>
        </section>
      </div>
    </section>
  );
}
