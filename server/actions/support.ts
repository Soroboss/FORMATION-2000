"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { createSupportTicket } from "@/server/repositories/support";

const ticketSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  category: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10).max(5000),
});

export async function createSupportTicketAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const parsed = ticketSchema.safeParse({
    subject: String(formData.get("subject") ?? ""),
    category: String(formData.get("category") ?? "") || undefined,
    message: String(formData.get("message") ?? ""),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
  }
  await createSupportTicket({
    userId: session.user.id,
    ...parsed.data,
  });
  revalidatePath("/app/support");
}
