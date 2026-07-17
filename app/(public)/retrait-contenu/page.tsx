import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  Clock,
  PlayCircle,
  Mail,
  ScrollText,
} from "lucide-react";
import { TakedownForm } from "@/features/legal/takedown-form";

export const metadata: Metadata = {
  title: "Retrait de contenu",
  description:
    "Créateurs et ayants droit : demandez le retrait d'une vidéo YouTube référencée sur Learnoon Academy.",
};

const STEPS = [
  {
    icon: ShieldCheck,
    title: "Qui peut demander",
    text: "Le créateur de la vidéo, le titulaire des droits ou son représentant mandaté.",
  },
  {
    icon: FileText,
    title: "Ce dont nous avons besoin",
    text: "Votre nom, un e-mail de contact, l'URL exacte de la vidéo et le motif de la demande.",
  },
  {
    icon: Clock,
    title: "Ce qui se passe ensuite",
    text: "Nous accusons réception, étudions la demande et retirons le référencement si elle est fondée.",
  },
];

export default function RetraitContenuPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
        <ScrollText className="h-4 w-4" strokeWidth={2} aria-hidden />
        Propriété intellectuelle
      </div>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
        Demande de retrait de contenu
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-muted">
        Learnoon Academy organise des vidéos pédagogiques publiques en parcours par catégorie.
        Vous êtes créateur ou ayant droit et souhaitez qu&apos;une vidéo ne soit plus référencée
        sur la plateforme ? Utilisez ce formulaire : chaque demande est étudiée et traitée
        rapidement.
      </p>

      <div className="mt-8 rounded-brand border border-brand-100 bg-brand-50/50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-soft bg-white text-brand-600">
            <PlayCircle className="h-5 w-5" strokeWidth={2} aria-hidden />
          </span>
          <p className="text-sm leading-relaxed text-ink">
            Learnoon n&apos;héberge ni ne télécharge aucune vidéo. Nous utilisons uniquement le
            <span className="font-semibold"> lecteur officiel YouTube</span> et créditons chaque
            créateur avec un lien vers sa chaîne. Le retrait supprime le référencement de la vidéo
            sur la plateforme.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.title} className="ui-card p-4 sm:p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-soft bg-brand-50 text-brand-600">
              <step.icon className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <h2 className="mt-3 font-display text-base font-bold text-ink">{step.title}</h2>
            <p className="mt-1 text-sm text-ink-muted">{step.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 ui-card p-5 sm:p-7">
        <h2 className="font-display text-xl font-bold text-ink">Formulaire de retrait</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Tous les champs sont requis. Nous vous répondons par e-mail.
        </p>
        <TakedownForm />
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-brand border border-canvas-border p-4 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          Une question avant d&apos;envoyer votre demande ?
        </p>
        <Link
          href="/contact"
          className="inline-flex h-10 items-center justify-center rounded-brand border-2 border-brand-600 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-50"
        >
          Contacter l&apos;équipe
        </Link>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-muted">
        En soumettant ce formulaire, vous déclarez être le titulaire des droits ou son
        représentant autorisé. Consultez nos{" "}
        <Link href="/conditions-utilisation" className="font-semibold text-brand-600 underline">
          conditions d&apos;utilisation
        </Link>{" "}
        et notre{" "}
        <Link href="/politique-confidentialite" className="font-semibold text-brand-600 underline">
          politique de confidentialité
        </Link>
        .
      </p>
    </section>
  );
}
