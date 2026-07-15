import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Connexion</h1>
        <p className="mt-1 text-sm text-slate-600">
          Apprenant : accédez à vos formations. Administrateur : accédez au tableau de bord
          d&apos;administration.
        </p>
      </div>
      {emailVerifiedByLink ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          E-mail vérifié avec succès. Connectez-vous avec votre mot de passe.
        </p>
      ) : null}
      {params.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Impossible de finaliser l&apos;authentification. Réessayez.
        </p>
      ) : null}
      <LoginForm nextPath={params.next} />
    </div>
  );
}
