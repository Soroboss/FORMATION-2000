"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import {
  errorMessage,
  redirectWithFlash,
  rethrowRedirect,
  safeReturnPath,
} from "@/lib/action-feedback";
import {
  addSupportMessage,
  createSupportTicket,
  getSupportTicketForUser,
} from "@/server/repositories/support";

const ticketSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  category: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10).max(5000),
});

const replySchema = z.object({
  ticketId: z.string().uuid(),
  message: z.string().trim().min(2).max(5000),
});

export async function createSupportTicketAction(formData: FormData): Promise<void> {
  const back = safeReturnPath(String(formData.get("returnTo") ?? "").trim(), "/app/support");
  try {
    const session = await requireSession();
    const parsed = ticketSchema.safeParse({
      subject: String(formData.get("subject") ?? ""),
      category: String(formData.get("category") ?? "") || undefined,
      message: String(formData.get("message") ?? ""),
    });
    if (!parsed.success) {
      redirectWithFlash(
        back,
        "error",
        parsed.error.issues[0]?.message ?? "Données invalides",
      );
    }
    const ticket = await createSupportTicket({
      userId: session.user.id,
      ...parsed.data,
    });
    revalidatePath("/app/support");
    redirect(`/app/support/${ticket.id}?ok=${encodeURIComponent("Ticket créé")}`);
  } catch (error) {
    rethrowRedirect(error);
    redirectWithFlash(back, "error", errorMessage(error));
  }
}

export async function replySupportTicketAsLearnerAction(formData: FormData): Promise<void> {
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const back = safeReturnPath(
    String(formData.get("returnTo") ?? "").trim(),
    ticketId ? `/app/support/${ticketId}` : "/app/support",
  );
  try {
    const session = await requireSession();
    const parsed = replySchema.safeParse({
      ticketId,
      message: String(formData.get("message") ?? ""),
    });
    if (!parsed.success) {
      redirectWithFlash(
        back,
        "error",
        parsed.error.issues[0]?.message ?? "Données invalides",
      );
    }

    const ticket = await getSupportTicketForUser({
      ticketId: parsed.data.ticketId,
      userId: session.user.id,
    });
    if (!ticket) {
      redirectWithFlash(back, "error", "Ticket introuvable");
    }
    if (ticket.status === "closed") {
      redirectWithFlash(back, "error", "Ce ticket est fermé");
    }

    await addSupportMessage({
      ticketId: parsed.data.ticketId,
      senderId: session.user.id,
      message: parsed.data.message,
      isInternal: false,
    });

    revalidatePath(`/app/support/${parsed.data.ticketId}`);
    revalidatePath("/app/support");
    revalidatePath(`/admin/support/${parsed.data.ticketId}`);
    revalidatePath("/admin/support");
    redirectWithFlash(back, "ok", "Message envoyé");
  } catch (error) {
    rethrowRedirect(error);
    redirectWithFlash(back, "error", errorMessage(error));
  }
}
