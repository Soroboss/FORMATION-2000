import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, Mail, MapPin, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Learnoon Academy par WhatsApp ou e-mail pour toute question sur l’abonnement, les formations ou le support.",
};

function getContactWhatsApp(): string {
  return (process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? "2250757228731").replace(/\D/g, "");
}

function getContactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "soroboss.bossimpact@gmail.com";
}

function formatWhatsAppDisplay(digits: string): string {
  // 225 07 57 22 87 31
  if (digits.startsWith("225") && digits.length >= 13) {
    const rest = digits.slice(3);
    return `+225 ${rest.slice(0, 2)} ${rest.slice(2, 4)} ${rest.slice(4, 6)} ${rest.slice(6, 8)} ${rest.slice(8)}`;
  }
  return `+${digits}`;
}

export default function ContactPage() {
  const whatsapp = getContactWhatsApp();
  const email = getContactEmail();
  const whatsappDisplay = formatWhatsAppDisplay(whatsapp);
  const waUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    "Bonjour Learnoon Academy, j’ai une question concernant…",
  )}`;

  return (
    <>
      <section className="border-b border-canvas-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="animate-fade-up text-sm font-semibold uppercase tracking-wide text-brand-600">
            Contact
          </p>
          <h1 className="animate-fade-up mt-2 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Nous sommes là pour vous accompagner.
          </h1>
          <p className="animate-fade-up-delay-1 mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Une question sur l&apos;abonnement, un paiement Mobile Money, ou besoin d&apos;aide pour
            démarrer ? Écrivez-nous — réponse rapide et claire.
          </p>
        </div>
      </section>

      <section className="bg-canvas py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ui-card group block p-6 transition hover:-translate-y-0.5 hover:border-progress-500 hover:shadow-md sm:p-8"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-soft bg-progress-50 text-progress-600">
              <MessageCircle className="h-6 w-6" strokeWidth={2} aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold text-ink">WhatsApp</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Le canal le plus rapide pour le support et la confirmation de paiement.
            </p>
            <p className="mt-4 font-display text-lg font-semibold text-progress-700 group-hover:underline">
              {whatsappDisplay}
            </p>
            <span className="mt-6 inline-flex h-11 items-center rounded-brand bg-progress-500 px-5 text-sm font-semibold text-white transition group-hover:bg-progress-600">
              Ouvrir WhatsApp →
            </span>
          </a>

          <a
            href={`mailto:${email}?subject=${encodeURIComponent("Contact Learnoon Academy")}`}
            className="ui-card group block p-6 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md sm:p-8"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-soft bg-brand-50 text-brand-600">
              <Mail className="h-6 w-6" strokeWidth={2} aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold text-ink">E-mail</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Pour les demandes détaillées, partenariats ou questions administratives.
            </p>
            <p className="mt-4 break-all font-display text-lg font-semibold text-brand-700 group-hover:underline">
              {email}
            </p>
            <span className="mt-6 inline-flex h-11 items-center rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white transition group-hover:bg-brand-700">
              Envoyer un e-mail →
            </span>
          </a>
        </div>

        <div className="mx-auto mt-8 grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2">
          <div className="ui-card flex gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-soft bg-action-50 text-action-600">
              <Clock3 className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <h3 className="font-display font-semibold text-ink">Disponibilité</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Support du lundi au samedi. Sur WhatsApp, répondez en général sous quelques heures
                en journée.
              </p>
            </div>
          </div>
          <div className="ui-card flex gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-soft bg-brand-50 text-brand-600">
              <MapPin className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <h3 className="font-display font-semibold text-ink">Zone</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Côte d&apos;Ivoire & Afrique francophone — plateforme 100&nbsp;% en ligne.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-canvas-border bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl font-bold text-ink">Avant d&apos;écrire</h2>
          <p className="mt-3 text-sm text-ink-muted">
            Paiement Mobile Money, tarifs ou FAQ : les réponses sont souvent déjà ici.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/paiement/manuel"
              className="inline-flex h-11 items-center justify-center rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Paiement WhatsApp
            </Link>
            <Link
              href="/faq"
              className="inline-flex h-11 items-center justify-center rounded-brand border-2 border-brand-600 px-5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              Voir la FAQ
            </Link>
            <Link
              href="/tarifs"
              className="inline-flex h-11 items-center justify-center rounded-brand border-2 border-brand-600 px-5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              Tarifs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
