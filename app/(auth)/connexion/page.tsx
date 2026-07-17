import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { LoginForm } from "@/features/auth/login-form";
import { getSession } from "@/lib/auth/session";
import { resolvePostLoginPath } from "@/lib/permissions/roles";
import {
  disableLearnerPreview,
  enableLearnerPreview,
  isLearnerPreviewActive,
} from "@/lib/auth/workspace";
import { canAccessAdmin } from "@/lib/permissions/roles";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string;
    error?: string;
    insforge_type?: string;
    insforge_status?: string;
  }>;
}) {
  const params = await searchParams;
  const emailVerifiedByLink =
    params.insforge_type === "verify_email" && params.insforge_status === "success";
  const session = await getSession();
  if (session) {
    const destination = resolvePostLoginPath(params.next, session.roles);
    if (canAccessAdmin(session.roles) && destination.startsWith("/app")) {
      await enableLearnerPreview();
    } else if (!(await isLearnerPreviewActive())) {
      await disableLearnerPreview();
    }
    redirect(destination);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Bon retour</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Connectez-vous pour retrouver vos formations et reprendre votre progression.
        </p>
      </div>
      {emailVerifiedByLink ? (
        <p className="flex items-start gap-2 rounded-soft border border-progress-200 bg-progress-50 px-3 py-2.5 text-sm text-progress-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          <span>E-mail vérifié avec succès. Connectez-vous avec votre mot de passe.</span>
        </p>
      ) : null}
      {params.error ? (
        <p className="flex items-start gap-2 rounded-soft border border-danger/30 bg-danger-50 px-3 py-2.5 text-sm text-danger-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          <span>Impossible de finaliser l&apos;authentification. Réessayez.</span>
        </p>
      ) : null}
      <LoginForm nextPath={params.next} />
    </div>
  );
}
