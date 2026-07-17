"use client";

import { ShellNav } from "@/components/app/shell-nav";

const nav = [
  { href: "/admin/tableau-de-bord", label: "Vue d'ensemble", exact: true },
  { href: "/admin/formations", label: "Formations" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/sante-videos", label: "Santé vidéos" },
  { href: "/admin/membres", label: "Membres" },
  { href: "/admin/equipe", label: "Équipe & rôles" },
  { href: "/admin/offres", label: "Offres & tarifs" },
  { href: "/admin/abonnements", label: "Abonnements" },
  { href: "/admin/paiements", label: "Paiements" },
  { href: "/admin/paiements-manuels", label: "Paiements WhatsApp" },
  { href: "/admin/finances", label: "Finances" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/projets", label: "Exercices" },
  { href: "/admin/quiz", label: "Quiz" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/retraits", label: "Retraits contenu" },
  { href: "/admin/journaux", label: "Audit" },
  { href: "/admin/parametres", label: "Paramètres" },
];

export function AdminNav() {
  return <ShellNav items={nav} ariaLabel="Navigation administration" />;
}
