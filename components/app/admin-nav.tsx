"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin/tableau-de-bord", label: "Vue d'ensemble" },
  { href: "/admin/formations", label: "Formations" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/membres", label: "Membres" },
  { href: "/admin/abonnements", label: "Abonnements" },
  { href: "/admin/paiements", label: "Paiements" },
  { href: "/admin/paiements-manuels", label: "Paiements WhatsApp" },
  { href: "/admin/projets", label: "Exercices" },
  { href: "/admin/journaux", label: "Audit" },
  { href: "/admin/parametres", label: "Paramètres" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation administration"
      className="flex flex-row gap-1 overflow-x-auto lg:flex-col"
    >
      {nav.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/admin/tableau-de-bord" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-soft px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-brand-600 text-white"
                : "text-ink hover:bg-brand-50 hover:text-brand-700",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
