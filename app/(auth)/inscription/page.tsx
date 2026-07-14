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
        <h1 className="font-display text-2xl font-semibold text-slate-900">Créer un compte</h1>
        <p className="mt-1 text-sm text-slate-600">
          Rejoignez Académie 2000 et commencez votre parcours.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
