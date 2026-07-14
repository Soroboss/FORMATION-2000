import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe",
  robots: { index: false, follow: false },
};

export default function ReinitialiserMotDePassePage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-slate-900">
        Réinitialiser le mot de passe
      </h1>
      <p className="text-sm text-slate-600">
        Ouvrez le lien reçu par e-mail pour définir un nouveau mot de passe. Si le lien a expiré,
        demandez-en un nouveau.
      </p>
      <Link href="/mot-de-passe-oublie" className="text-sm font-semibold text-brand-700 underline">
        Renvoyer un lien
      </Link>
    </div>
  );
}
