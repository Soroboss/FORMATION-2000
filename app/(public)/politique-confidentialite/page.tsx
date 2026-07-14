import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function ConfidentialitePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink">
        Politique de confidentialité
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Learnoon Academy — dernière mise à jour : juillet 2026
      </p>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-ink">
        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">1. Qui sommes-nous ?</h2>
          <p className="text-ink-muted">
            Learnoon Academy (« nous ») édite une plateforme de formation en ligne accessible par
            abonnement. La présente politique explique quelles données personnelles nous
            collectons, pourquoi, et quels sont vos droits.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">2. Données collectées</h2>
          <p className="text-ink-muted">Nous pouvons collecter :</p>
          <ul className="list-disc space-y-1 pl-5 text-ink-muted">
            <li>identité (prénom, nom, e-mail) ;</li>
            <li>numéro WhatsApp / téléphone fourni à l&apos;inscription ;</li>
            <li>données de compte et d&apos;authentification ;</li>
            <li>données d&apos;abonnement et de paiement (références, statut, montants) ;</li>
            <li>données pédagogiques (progression, notes, favoris, exercices) ;</li>
            <li>données techniques utiles au service (logs de sécurité, navigateur, adresse IP
              approximative).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">3. Finalités</h2>
          <p className="text-ink-muted">Vos données sont utilisées pour :</p>
          <ul className="list-disc space-y-1 pl-5 text-ink-muted">
            <li>créer et gérer votre compte ;</li>
            <li>fournir l&apos;accès aux formations et suivre votre progression ;</li>
            <li>traiter les paiements et confirmer les abonnements (y compris via WhatsApp /
              Mobile Money) ;</li>
            <li>assurer le support et la sécurité de la plateforme ;</li>
            <li>respecter nos obligations légales et améliorer le service.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">4. Bases du traitement</h2>
          <p className="text-ink-muted">
            Selon les cas : exécution du contrat (compte / abonnement), consentement (lorsque
            requis), intérêt légitime (sécurité, amélioration) ou obligation légale.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">5. Destinataires</h2>
          <p className="text-ink-muted">
            Les données sont accessibles aux équipes autorisées de Learnoon Academy et, le cas
            échéant, à nos prestataires techniques (hébergement, authentification, paiement),
            uniquement dans la mesure nécessaire à leurs missions. Nous ne vendons pas vos données
            personnelles.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">6. Conservation</h2>
          <p className="text-ink-muted">
            Les données sont conservées pendant la durée nécessaire aux finalités ci-dessus, puis
            archivées ou supprimées selon les délais légaux applicables (comptabilité, litiges,
            sécurité).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">7. Sécurité</h2>
          <p className="text-ink-muted">
            Nous mettons en œuvre des mesures raisonnables (contrôles d&apos;accès, cookies
            sécurisés, journalisation) pour protéger vos données. Aucun système n&apos;étant
            infaillible, nous vous invitons à utiliser un mot de passe unique et robuste.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">8. Vos droits</h2>
          <p className="text-ink-muted">
            Selon la réglementation applicable, vous pouvez demander l&apos;accès, la rectification,
            la suppression, la limitation ou la portabilité de vos données, et vous opposer à
            certains traitements. Pour exercer ces droits, contactez-nous via la page{" "}
            <Link href="/contact" className="font-semibold text-brand-600 underline">
              Contact
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">9. Cookies</h2>
          <p className="text-ink-muted">
            Nous utilisons des cookies essentiels à l&apos;authentification et au fonctionnement du
            site. Des outils d&apos;analyse (ex. Vercel Analytics) peuvent être utilisés pour
            comprendre l&apos;usage de la plateforme de façon agrégée.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">10. Contact</h2>
          <p className="text-ink-muted">
            Pour toute question relative à cette politique : page{" "}
            <Link href="/contact" className="font-semibold text-brand-600 underline">
              Contact
            </Link>
            . Voir aussi les{" "}
            <Link href="/conditions-utilisation" className="font-semibold text-brand-600 underline">
              Conditions d&apos;utilisation
            </Link>
            .
          </p>
        </section>

        <p className="rounded-soft border border-canvas-border bg-canvas p-4 text-sm text-ink-muted">
          Cette page constitue une base informative. Une validation par un professionnel du droit
          compétent est recommandée avant un lancement commercial à grande échelle.
        </p>
      </div>
    </section>
  );
}
