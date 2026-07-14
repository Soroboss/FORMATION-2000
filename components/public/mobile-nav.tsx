"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/server/actions/auth";

const links = [
  { href: "/formations", label: "Formations" },
  { href: "/categories", label: "Catégories" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/faq", label: "FAQ" },
];

export function MobileNav({
  isAuthenticated,
  homeHref = "/app/tableau-de-bord",
  homeLabel = "Mon espace",
}: {
  isAuthenticated: boolean;
  homeHref?: string;
  homeLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

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
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-ink/35 backdrop-blur-[1px]"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-menu"
            className="absolute left-0 right-0 top-16 z-40 max-h-[min(80dvh,560px)] overflow-y-auto border-b border-slate-200 bg-white p-4 shadow-lg"
          >
            <nav aria-label="Navigation mobile" className="flex flex-col gap-1">
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
                <>
                  <Link
                    href={homeHref}
                    className="rounded-lg bg-brand-700 px-3 py-3 text-center text-sm font-semibold text-white"
                    onClick={() => setOpen(false)}
                  >
                    {homeLabel}
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Déconnexion
                    </button>
                  </form>
                </>
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
                    className="rounded-lg bg-brand-600 px-3 py-3 text-center text-sm font-semibold text-white"
                    onClick={() => setOpen(false)}
                  >
                    Commencer
                  </Link>
                </>
              )}
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
