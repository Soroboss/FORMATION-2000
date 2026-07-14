"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app/tableau-de-bord", label: "Tableau de bord" },
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
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation apprenant"
      className="flex flex-row gap-1 overflow-x-auto lg:flex-col"
    >
      {nav.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/app/tableau-de-bord" && pathname.startsWith(item.href));
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
