"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/session";
import { hasAnyRole } from "@/lib/permissions/roles";
import { writeAuditLog } from "@/lib/audit/write";
import {
  createTakedownRequest,
  updateTakedownStatus,
  type TakedownStatus,
} from "@/server/repositories/takedown";

export type TakedownActionResult = { success: boolean; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitTakedownAction(
  formData: FormData,
): Promise<TakedownActionResult> {
  const creatorName = String(formData.get("creatorName") ?? "").trim();
  const creatorEmail = String(formData.get("creatorEmail") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (creatorName.length < 2) return { success: false, error: "Indiquez votre nom." };
  if (!EMAIL_RE.test(creatorEmail)) return { success: false, error: "E-mail invalide." };
  if (!/^https?:\/\//i.test(videoUrl)) {
    return { success: false, error: "Indiquez l'URL de la vidéo concernée." };
  }
  if (reason.length < 10) {
    return { success: false, error: "Précisez le motif (10 caractères minimum)." };
  }

  try {
    await createTakedownRequest({ creatorName, creatorEmail, videoUrl, reason });
    return { success: true };
  } catch {
    return { success: false, error: "Envoi impossible. Réessayez plus tard." };
  }
}

export async function updateTakedownAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  if (!hasAnyRole(session.roles, ["admin", "super_admin", "support"])) {
    throw new Error("FORBIDDEN");
  }
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "") as TakedownStatus;
  if (!id || !["pending", "in_review", "accepted", "rejected"].includes(status)) return;

  await updateTakedownStatus({
    id,
    status,
    adminNote: String(formData.get("adminNote") ?? "").trim() || null,
    handledBy: session.user.id,
  });
  await writeAuditLog({
    actorUserId: session.user.id,
    action: `takedown.${status}`,
    entityType: "takedown_request",
    entityId: id,
  });
  revalidatePath("/admin/retraits");
}
