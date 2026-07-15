"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import {
  errorMessage,
  redirectWithFlash,
  rethrowRedirect,
  safeReturnPath,
} from "@/lib/action-feedback";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/repositories/notifications";

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const back = safeReturnPath(
    String(formData.get("returnTo") ?? "").trim(),
    "/app/notifications",
  );
  try {
    const session = await requireSession();
    const notificationId = String(formData.get("notificationId") ?? "").trim();
    if (!notificationId) {
      redirectWithFlash(back, "error", "Notification manquante");
    }
    await markNotificationRead({
      notificationId,
      userId: session.user.id,
    });
    revalidatePath("/app/notifications");
    revalidatePath("/app");
    redirectWithFlash(back, "ok", "Notification marquée comme lue");
  } catch (error) {
    rethrowRedirect(error);
    redirectWithFlash(back, "error", errorMessage(error));
  }
}

export async function markAllNotificationsReadAction(formData?: FormData): Promise<void> {
  const back = safeReturnPath(
    String(formData?.get("returnTo") ?? "").trim(),
    "/app/notifications",
  );
  try {
    const session = await requireSession();
    await markAllNotificationsRead(session.user.id);
    revalidatePath("/app/notifications");
    revalidatePath("/app");
    redirectWithFlash(back, "ok", "Toutes les notifications sont lues");
  } catch (error) {
    rethrowRedirect(error);
    redirectWithFlash(back, "error", errorMessage(error));
  }
}
