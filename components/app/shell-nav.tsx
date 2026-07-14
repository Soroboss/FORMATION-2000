"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ShellNavItem = {
  href: string;
  label: string;
  /** Exact match root (e.g. dashboard) so children don't keep it active */
  exact?: boolean;
};

type ShellNavProps = {
  items: ShellNavItem[];
  ariaLabel: string;
};

/**
 * Sidebar on md+, drawer on small screens — avoids endless horizontal chip scroll.
 */
export function ShellNav({ items, ariaLabel }: ShellNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

  const activeHref =
    items.find((item) =>
      item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.href ?? items[0]?.href;

  const activeLabel = items.find((i) => i.href === activeHref)?.label ?? "Menu";

  function linkClass(href: string, exact?: boolean) {
    const active = exact
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
    return cn(
      "block rounded-soft px-3 py-2.5 text-sm font-medium transition",
      active
        ? "bg-brand-600 text-white"
        : "text-ink hover:bg-brand-50 hover:text-brand-700",
    );
  }

  return (
    <>
      {/* Mobile trigger */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between gap-3 rounded-soft border border-canvas-border bg-white px-3 py-2.5 text-left text-sm font-semibold text-ink"
          aria-expanded={open}
          aria-controls="shell-nav-drawer"
        >
          <span className="min-w-0 truncate">
            <span className="text-ink-muted">Menu · </span>
            {activeLabel}
          </span>
          <Menu className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
        </button>
      </div>

      {/* Desktop / tablet sidebar list */}
      <nav aria-label={ariaLabel} className="hidden flex-col gap-1 md:flex">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(item.href, item.exact)}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          />
          <div
            id="shell-nav-drawer"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-canvas-border px-4 py-3">
              <p className="text-sm font-semibold text-ink">{ariaLabel}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-soft border border-canvas-border text-ink"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav
              aria-label={ariaLabel}
              className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClass(item.href, item.exact)}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
