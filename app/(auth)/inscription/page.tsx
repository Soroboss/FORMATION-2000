import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "Inscription",
  robots: { index: false, follow: false },
};

export default function InscriptionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Créer un compte</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Rejoignez Learnoon Academy — Apprends. Évolue. Réussis.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
