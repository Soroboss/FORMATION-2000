"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/formations", label: "Formations" },
  { href: "/categories", label: "Catégories" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/faq", label: "FAQ" },
];

export function MobileNav({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-200 bg-white text-brand-900"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true" className="text-lg leading-none">
          {open ? "×" : "☰"}
        </span>
      </button>
      {open ? (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 top-16 z-40 border-b border-slate-200 bg-white p-4 shadow-lg"
        >
          <nav aria-label="Navigation mobile" className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-800 hover:bg-brand-50"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Link
                href="/app/tableau-de-bord"
                className="rounded-lg bg-brand-700 px-3 py-3 text-center text-sm font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                Mon espace
              </Link>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-brand-800 hover:bg-brand-50"
                  onClick={() => setOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="rounded-lg bg-action-600 px-3 py-3 text-center text-sm font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  Commencer
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
