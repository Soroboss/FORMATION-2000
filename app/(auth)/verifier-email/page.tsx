import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { mustVerifyEmailForLearnerApp } from "@/lib/auth/email-verification";
import { VerifyEmailForm } from "@/features/auth/verify-email-form";

export const metadata: Metadata = {
  title: "Vérifier votre e-mail",
  robots: { index: false, follow: false },
};

export default async function VerifierEmailPage() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion?next=/verifier-email");
  }

  if (!mustVerifyEmailForLearnerApp(session)) {
    redirect("/app/tableau-de-bord");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">
          Vérifiez votre e-mail
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Pour accéder aux formations, confirmez votre adresse e-mail.
        </p>
      </div>
      <VerifyEmailForm email={session.user.email} />
    </div>
  );
}
