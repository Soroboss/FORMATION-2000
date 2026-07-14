import Link from "next/link";
import { getAppName } from "@/lib/utils";

const links = [
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/conditions-utilisation", label: "Conditions" },
  { href: "/politique-confidentialite", label: "Confidentialité" },
  { href: "/retrait-contenu", label: "Retrait de contenu" },
];

export function PublicFooter() {
  const appName = getAppName();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-slate-600">
          © {year} {appName}. Formation par abonnement — Côte d&apos;Ivoire.
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-brand-800 hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
