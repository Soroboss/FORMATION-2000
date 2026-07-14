"use server";

import { redirect } from "next/navigation";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "@/lib/validation/auth";
import { getAppUrl, safeInternalPath } from "@/lib/utils";

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
    password: String(formData.get("password") ?? ""),
    acceptTerms: formData.get("acceptTerms") === "on" || formData.get("acceptTerms") === "true",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const { firstName, lastName, email, password } = parsed.data;
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

    if (data?.requireEmailVerification) {
      return { success: true, requireEmailVerification: true };
    }

    if (data?.accessToken && data?.refreshToken) {
      await setAuthCookies(data.accessToken, data.refreshToken);

      // Best-effort profile enrichment (trigger also creates the base row).
      if (data.user?.id) {
        const authed = createInsForgeServerClient(data.accessToken);
        await authed.database
          .from("profiles")
          .update({
            first_name: firstName,
            last_name: lastName,
            display_name: displayName,
            email,
          })
          .eq("id", data.user.id);
      }
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

  const next = safeInternalPath(formString(formData, "next") || null);

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

    redirect(next);
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
  await clearAuthCookies();
  redirect("/connexion");
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
