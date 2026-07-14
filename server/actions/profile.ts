"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "@/lib/auth/cookies";
import { requireSession } from "@/lib/auth/session";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import { updateProfileSchema } from "@/lib/validation/auth";

export type UpdateProfileResult = {
  success: boolean;
  error?: string;
};

export async function updateProfileAction(formData: FormData): Promise<UpdateProfileResult> {
  try {
    const session = await requireSession();
    const parsed = updateProfileSchema.safeParse({
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
      displayName: String(formData.get("displayName") ?? "").trim(),
      whatsapp: String(formData.get("whatsapp") ?? "").trim(),
    });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Données invalides.",
      };
    }

    const token = await getAccessToken();
    if (!token) {
      return { success: false, error: "Session expirée. Reconnectez-vous." };
    }

    const displayName =
      parsed.data.displayName.trim() ||
      `${parsed.data.firstName} ${parsed.data.lastName}`.trim();

    const client = createInsForgeServerClient(token);
    const { error } = await client.database
      .from("profiles")
      .update({
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        display_name: displayName,
        phone: parsed.data.whatsapp,
      })
      .eq("id", session.user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/app/profil");
    revalidatePath("/app");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Mise à jour impossible.",
    };
  }
}
