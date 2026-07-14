"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { initializeCheckout } from "@/server/services/payments";

export type CheckoutActionResult = {
  success: boolean;
  error?: string;
  checkoutUrl?: string;
};

export async function startCheckoutAction(formData: FormData): Promise<CheckoutActionResult> {
  try {
    const session = await requireSession();
    const planSlug = String(formData.get("planSlug") ?? "acces-mensuel");

    const result = await initializeCheckout({
      userId: session.user.id,
      email: session.user.email,
      displayName: session.profile?.displayName ?? session.user.name,
      planSlug,
    });

    redirect(result.checkoutUrl);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Impossible d'initialiser le paiement.",
    };
  }
}
