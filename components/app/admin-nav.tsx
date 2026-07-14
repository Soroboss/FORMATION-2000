"use client";

import { ShellNav } from "@/components/app/shell-nav";

const nav = [
  { href: "/admin/tableau-de-bord", label: "Vue d'ensemble", exact: true },
  { href: "/admin/formations", label: "Formations" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/membres", label: "Membres" },
  { href: "/admin/abonnements", label: "Abonnements" },
  { href: "/admin/paiements", label: "Paiements" },
  { href: "/admin/paiements-manuels", label: "Paiements WhatsApp" },
  { href: "/admin/projets", label: "Exercices" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/journaux", label: "Audit" },
  { href: "/admin/parametres", label: "Paramètres" },
];

export function AdminNav() {
  return <ShellNav items={nav} ariaLabel="Navigation administration" />;
}
