import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  robots: { index: false, follow: false },
};

export default function MotDePasseOubliePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">
          Mot de passe oublié
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Entrez votre e-mail pour recevoir un lien de réinitialisation.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
