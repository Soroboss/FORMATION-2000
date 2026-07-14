"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/repositories/notifications";

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const notificationId = String(formData.get("notificationId") ?? "").trim();
  if (!notificationId) throw new Error("Notification manquante");
  await markNotificationRead({
    notificationId,
    userId: session.user.id,
  });
  revalidatePath("/app/notifications");
  revalidatePath("/app");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await requireSession();
  await markAllNotificationsRead(session.user.id);
  revalidatePath("/app/notifications");
  revalidatePath("/app");
}
