import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Lock,
  PlayCircle,
  Smartphone,
  Target,
  Trophy,
} from "lucide-react";
import { CategoryCard } from "@/components/learning/category-card";
import { CourseCard } from "@/components/learning/course-card";
import { BrandLogo } from "@/components/brand/logo";
import { listCategories, listCourses } from "@/server/repositories/catalog";

const benefits = [
  {
    icon: PlayCircle,
    title: "Vidéos sélectionnées",
    text: "Les meilleures ressources en ligne, organisées dans un ordre pédagogique clair.",
  },
  {
    icon: Target,
    title: "Missions concrètes",
    text: "Chaque leçon vise un résultat : un livrable, une compétence, une preuve de maîtrise.",
  },
  {
    icon: Trophy,
    title: "Progression mesurable",
    text: "Suivi, exercices, attestations internes — vous voyez ce que vous avez gagné.",
  },
  {
    icon: Smartphone,
    title: "Paiement simple",
    text: "2 000 FCFA / 30 jours. Mobile Money + WhatsApp si le paiement en ligne bloque.",
  },
];

const steps = [
  {
    n: "01",
    title: "Inscrivez-vous",
    text: "Compte en 2 minutes. E-mail + WhatsApp pour le suivi et les confirmations.",
  },
  {
    n: "02",
    title: "Activez l’accès",
    text: "Payez 2 000 FCFA pour 30 jours d’accès à l’ensemble du catalogue inclus.",
  },
  {
    n: "03",
    title: "Apprenez et produisez",
    text: "Suivez les parcours, pratiquez, validez — et repartez avec des compétences utiles.",
  },
];

const included = [
  "Catalogue multi-domaines (tech, business, créa…)",
  "Parcours structurés débutant → avancé",
  "Lecteur vidéo intégré + crédits créateurs",
  "Exercices pratiques et suivi de progression",
  "Notes, favoris et attestations internes",
  "Support et paiement Mobile Money / WhatsApp",
];

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    listCategories(),
    listCourses({ featured: true }),
  ]);

  return (
    <>
      {/* HERO — une composition, marque dominante */}
      <section className="relative overflow-hidden border-b border-canvas-border bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:py-16">
          <div className="animate-fade-up">
            <BrandLogo variant="full" className="max-w-[180px] items-start sm:max-w-[210px]" />
            <h1 className="mt-6 max-w-xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Formez-vous sans limite. Produisez dès le premier parcours.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              Learnoon Academy démocratise les meilleures formations : parcours structurés,
              pratique guidée et accès premium à{" "}
              <strong className="font-semibold text-ink">2&nbsp;000&nbsp;FCFA / 30 jours</strong>.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/inscription"
                className="inline-flex h-12 items-center justify-center rounded-brand bg-brand-600 px-6 text-base font-semibold text-white transition hover:bg-brand-700"
              >
                Commencer maintenant →
              </Link>
              <Link
                href="/tarifs"
                className="inline-flex h-12 items-center justify-center rounded-brand border-2 border-brand-600 bg-transparent px-6 text-base font-semibold text-brand-600 transition hover:bg-brand-50"
              >
                Voir l&apos;offre
              </Link>
            </div>
            <p className="mt-4 text-sm text-ink-muted">
              Accès immédiat après confirmation · Renouvellement manuel · Sans engagement caché
            </p>
          </div>

          <div className="animate-fade-up-delay-1 relative -mx-4 sm:mx-0 lg:-mr-6">
            <div className="animate-float-slow relative aspect-[16/10] overflow-hidden sm:rounded-card lg:rounded-l-card lg:rounded-r-none">
              <Image
                src="/illustrations/hero-workspace.png"
                alt="Espace d’apprentissage Learnoon Academy : poste de travail technique et progression"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Promesse */}
      <section className="bg-canvas py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="animate-fade-up max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Pourquoi Learnoon
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              La connaissance accessible à tous.
            </h2>
            <p className="mt-3 text-ink-muted">
              Pas besoin d&apos;acheter dix formations. Un abonnement simple, des parcours curés,
              et une méthode conçue pour l&apos;Afrique francophone : mobile-first, claire,
              motivante.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((item) => (
              <div key={item.title} className="ui-card p-5">
                <item.icon className="h-6 w-6 text-brand-600" strokeWidth={2} aria-hidden />
                <h3 className="mt-3 font-display text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Méthode + illustration */}
      <section className="border-y border-canvas-border bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-action-600">
              Méthode
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              Voir · Pratiquer · Valider
            </h2>
            <p className="mt-3 text-ink-muted">
              Chaque module est conçu comme un pipeline technique : vous regardez, vous appliquez,
              vous validez. Objectif : une compétence utilisable, pas une simple vidéo regardée.
            </p>
            <ol className="mt-8 space-y-5">
              {steps.map((step) => (
                <li key={step.n} className="flex gap-4">
                  <span className="font-display text-2xl font-bold text-brand-600">{step.n}</span>
                  <div>
                    <h3 className="font-display font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm text-ink-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-card shadow-card">
            <Image
              src="/illustrations/method-pipeline.png"
              alt="Pipeline pédagogique : regarder, pratiquer, valider"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Inclus + illustration compétences */}
      <section className="bg-canvas py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div className="relative order-2 aspect-[16/10] overflow-hidden rounded-card shadow-card lg:order-1">
            <Image
              src="/illustrations/skills-dashboard.png"
              alt="Tableau de compétences techniques : code, design, certifications"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-progress-600">
              Ce qui est inclus
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              Un abonnement. Des centaines de compétences.
            </h2>
            <p className="mt-3 text-ink-muted">
              Tech, marketing, créa, business… Tout est pensé pour monter en compétence rapidement,
              avec des outils de suivi dignes d&apos;une plateforme premium.
            </p>
            <ul className="mt-6 space-y-3">
              {included.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-ink">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-progress-500"
                    strokeWidth={2}
                    aria-hidden
                  />
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href="/formations"
              className="mt-8 inline-flex h-11 items-center rounded-brand bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Explorer le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* Catalogue live */}
      {categories.length > 0 ? (
        <section className="bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                  Catalogue
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-ink">
                  Catégories populaires
                </h2>
              </div>
              <Link href="/categories" className="text-sm font-semibold text-brand-600 hover:underline">
                Tout voir
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 3).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {featured.length > 0 ? (
        <section className="border-t border-canvas-border bg-canvas py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-action-600">
                  À la une
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-ink">
                  Formations populaires
                </h2>
              </div>
              <Link href="/formations" className="text-sm font-semibold text-brand-600 hover:underline">
                Catalogue
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 3).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Offre + paiement */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Offre claire
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              2&nbsp;000 FCFA. 30 jours. Accès premium.
            </h2>
            <p className="mt-3 text-ink-muted">
              Un prix pensé pour être accessible. Si le paiement en ligne ne passe pas, payez via
              Mobile Money et envoyez votre capture WhatsApp — un admin confirme et active votre
              accès.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-ink">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-brand-700">
                <Lock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Contenu premium
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-progress-50 px-3 py-1.5 text-progress-700">
                <GraduationCap className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Attestations
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-action-50 px-3 py-1.5 text-action-700">
                <BookOpen className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Catalogue complet
              </span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/inscription"
                className="inline-flex h-12 items-center justify-center rounded-brand bg-brand-600 px-6 text-base font-semibold text-white hover:bg-brand-700"
              >
                Créer mon compte
              </Link>
              <Link
                href="/paiement/manuel"
                className="inline-flex h-12 items-center justify-center rounded-brand border-2 border-brand-600 px-6 text-base font-semibold text-brand-600 hover:bg-brand-50"
              >
                Payer via WhatsApp
              </Link>
            </div>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-card shadow-card">
            <Image
              src="/illustrations/access-payment.png"
              alt="Accès digital et confirmation de paiement Mobile Money"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-canvas-border bg-brand-600 py-14 text-white sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Votre avenir commence par une compétence.
          </h2>
          <p className="mt-3 text-base text-white/90">
            Rejoignez Learnoon Academy aujourd&apos;hui. Apprenez. Évoluez. Réussissez.
          </p>
          <Link
            href="/inscription"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-brand bg-white px-8 text-base font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Commencer pour 2 000 FCFA →
          </Link>
        </div>
      </section>
    </>
  );
}
