"use client";

import { ShellNav } from "@/components/app/shell-nav";

const nav = [
  { href: "/app/tableau-de-bord", label: "Tableau de bord", exact: true },
  { href: "/app/catalogue", label: "Catalogue" },
  { href: "/app/mes-formations", label: "Mes formations" },
  { href: "/app/progression", label: "Progression" },
  { href: "/app/notifications", label: "Notifications" },
  { href: "/app/certificats", label: "Attestations" },
  { href: "/app/notes", label: "Notes" },
  { href: "/app/favoris", label: "Favoris" },
  { href: "/app/projets", label: "Exercices" },
  { href: "/app/abonnement", label: "Abonnement" },
  { href: "/app/paiements", label: "Paiements" },
  { href: "/app/support", label: "Support" },
  { href: "/app/profil", label: "Profil" },
];

export function LearnerNav() {
  return <ShellNav items={nav} ariaLabel="Navigation apprenant" />;
}
