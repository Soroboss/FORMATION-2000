"use server";

import { redirect } from "next/navigation";
import { createInsForgeServerClient, tryCreateInsForgeServiceClient } from "@/lib/insforge/server";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import {
  disableLearnerPreview,
  enableLearnerPreview,
} from "@/lib/auth/workspace";
import { getSession } from "@/lib/auth/session";
import { canAccessAdmin, resolvePostLoginPath } from "@/lib/permissions/roles";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "@/lib/validation/auth";
import { resendVerificationSchema, verifyEmailSchema } from "@/lib/validation/api";
import { getAppUrl } from "@/lib/utils";

export type AuthActionResult = {
  success: boolean;
  error?: string;
  requireEmailVerification?: boolean;
};

function formString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function registerAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse({
    firstName: formString(formData, "firstName"),
    lastName: formString(formData, "lastName"),
    email: formString(formData, "email").toLowerCase(),
    whatsapp: formString(formData, "whatsapp"),
    password: String(formData.get("password") ?? ""),
    acceptTerms: formData.get("acceptTerms") === "on" || formData.get("acceptTerms") === "true",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const { firstName, lastName, email, password, whatsapp } = parsed.data;
  const displayName = `${firstName} ${lastName}`.trim();

  try {
    const client = createInsForgeServerClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      name: displayName,
      redirectTo: `${getAppUrl()}/connexion`,
    });

    if (error) {
      return { success: false, error: error.message ?? "Inscription impossible." };
    }

    const userId = data?.user?.id;
    if (userId) {
      const privileged = tryCreateInsForgeServiceClient();
      const profileClient = privileged ?? (data.accessToken ? createInsForgeServerClient(data.accessToken) : null);
      if (profileClient) {
        await profileClient.database
          .from("profiles")
          .update({
            first_name: firstName,
            last_name: lastName,
            display_name: displayName,
            email,
            phone: whatsapp,
          })
          .eq("id", userId);
      }
    }

    if (data?.requireEmailVerification) {
      return { success: true, requireEmailVerification: true };
    }

    if (data?.accessToken && data?.refreshToken) {
      await setAuthCookies(data.accessToken, data.refreshToken);
    }

    redirect("/app/tableau-de-bord");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Inscription impossible.",
    };
  }
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse({
    email: formString(formData, "email").toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  try {
    const client = createInsForgeServerClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error || !data?.accessToken || !data?.refreshToken) {
      if (error?.statusCode === 403) {
        return {
          success: false,
          error: "E-mail non vérifié. Consultez votre boîte de réception.",
        };
      }
      return {
        success: false,
        error: error?.message ?? "Identifiants incorrects.",
      };
    }

    await setAuthCookies(data.accessToken, data.refreshToken);

    const authed = createInsForgeServerClient(data.accessToken);
    await authed.database
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.user?.id);

    const session = await getSession();
    const roles = session?.roles ?? ["learner"];
    const requestedNext = formString(formData, "next") || null;
    const destination = resolvePostLoginPath(requestedNext, roles);

    // Admin qui ouvre volontairement /app → mode aperçu apprenant.
    if (canAccessAdmin(roles) && destination.startsWith("/app")) {
      await enableLearnerPreview();
    } else {
      await disableLearnerPreview();
    }

    redirect(destination);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connexion impossible.",
    };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    const client = createInsForgeServerClient();
    await client.auth.signOut();
  } catch {
    // Ignore network errors on logout — cookies are cleared regardless.
  }
  await disableLearnerPreview();
  await clearAuthCookies();
  redirect("/connexion");
}

/** Admin → consulter l’espace apprenant (séparé, volontaire). */
export async function enterLearnerWorkspaceAction(): Promise<void> {
  const session = await getSession();
  if (!session || !canAccessAdmin(session.roles)) {
    redirect("/connexion");
  }
  await enableLearnerPreview();
  redirect("/app/tableau-de-bord");
}

/** Quitter l’espace apprenant et revenir à l’administration. */
export async function exitLearnerWorkspaceAction(): Promise<void> {
  await disableLearnerPreview();
  redirect("/admin/tableau-de-bord");
}

export async function verifyEmailAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = verifyEmailSchema.safeParse({
    email: formString(formData, "email").toLowerCase(),
    otp: formString(formData, "otp"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Code invalide.",
    };
  }

  try {
    const client = createInsForgeServerClient();
    const { data, error } = await client.auth.verifyEmail({
      email: parsed.data.email,
      otp: parsed.data.otp,
    });

    if (error || !data?.accessToken || !data?.refreshToken) {
      return {
        success: false,
        error: error?.message ?? "Code incorrect ou expiré.",
      };
    }

    await setAuthCookies(data.accessToken, data.refreshToken);
    redirect("/app/tableau-de-bord");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Vérification impossible.",
    };
  }
}

export async function resendVerificationEmailAction(
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = resendVerificationSchema.safeParse({
    email: formString(formData, "email").toLowerCase(),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "E-mail invalide.",
    };
  }

  try {
    const client = createInsForgeServerClient();
    const { error } = await client.auth.resendVerificationEmail({
      email: parsed.data.email,
      redirectTo: `${getAppUrl()}/connexion`,
    });

    if (error) {
      return { success: false, error: error.message ?? "Envoi impossible." };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Envoi impossible.",
    };
  }
}

export async function forgotPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formString(formData, "email").toLowerCase(),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "E-mail invalide.",
    };
  }

  try {
    const client = createInsForgeServerClient();
    const { error } = await client.auth.sendResetPasswordEmail({
      email: parsed.data.email,
      redirectTo: `${getAppUrl()}/reinitialiser-mot-de-passe`,
    });

    if (error) {
      return { success: false, error: error.message ?? "Envoi impossible." };
    }

    // Always return success to avoid email enumeration.
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Envoi impossible.",
    };
  }
}
