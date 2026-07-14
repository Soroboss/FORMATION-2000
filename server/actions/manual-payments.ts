"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession, requireSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/write";
import { createInternalPaymentReference } from "@/lib/payments/subscription-dates";
import {
  createManualPaymentRequest,
  getManualPaymentRequest,
  updateManualPaymentRequestStatus,
} from "@/server/repositories/manual-payments";
import {
  activateOrExtendSubscription,
  createPaymentRecord,
  getPlanById,
  getPlanBySlug,
  updatePaymentStatus,
} from "@/server/repositories/payments";

const requestSchema = z.object({
  payerPhone: z.string().trim().min(8, "Numéro trop court").max(30),
  payerName: z.string().trim().max(120).optional(),
  network: z.string().trim().max(40).optional(),
  transactionRef: z.string().trim().max(120).optional(),
  note: z.string().trim().max(1000).optional(),
  planSlug: z.string().trim().optional(),
});

export async function submitManualPaymentRequestAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const parsed = requestSchema.safeParse({
    payerPhone: String(formData.get("payerPhone") ?? ""),
    payerName: String(formData.get("payerName") ?? "") || undefined,
    network: String(formData.get("network") ?? "") || undefined,
    transactionRef: String(formData.get("transactionRef") ?? "") || undefined,
    note: String(formData.get("note") ?? "") || undefined,
    planSlug: String(formData.get("planSlug") ?? "") || undefined,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const plan =
    (parsed.data.planSlug ? await getPlanBySlug(parsed.data.planSlug) : null) ??
    (await getPlanBySlug("acces-mensuel"));
  if (!plan) throw new Error("Plan introuvable");

  await createManualPaymentRequest({
    userId: session.user.id,
    planId: plan.id,
    amount: plan.priceAmount,
    currency: plan.currency,
    payerPhone: parsed.data.payerPhone,
    payerName: parsed.data.payerName,
    network: parsed.data.network,
    transactionRef: parsed.data.transactionRef,
    note: parsed.data.note,
  });

  revalidatePath("/paiement/manuel");
  revalidatePath("/admin/paiements-manuels");
}

export async function approveManualPaymentAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const reviewNote = String(formData.get("reviewNote") ?? "").trim() || undefined;
  if (!id) throw new Error("ID manquant");

  const request = await getManualPaymentRequest(id);
  if (!request) throw new Error("Demande introuvable");
  if (request.status !== "pending") throw new Error("Demande déjà traitée");

  const plan =
    (request.planId ? await getPlanById(request.planId) : null) ??
    (await getPlanBySlug("acces-mensuel"));
  if (!plan) throw new Error("Plan introuvable");

  const internalReference = createInternalPaymentReference();
  const providerReference = `manual_${id}`;

  const payment = await createPaymentRecord({
    userId: request.userId,
    planId: plan.id,
    provider: "manual",
    providerReference,
    internalReference,
    amount: request.amount,
    currency: request.currency,
    status: "pending",
    metadata: {
      manualRequestId: id,
      network: request.network,
      payerPhone: request.payerPhone,
      transactionRef: request.transactionRef,
    },
  });

  const confirmedAt = new Date();
  const subscription = await activateOrExtendSubscription({
    userId: request.userId,
    planId: plan.id,
    durationDays: plan.durationDays,
    confirmedAt,
    source: "manual_whatsapp",
  });

  await updatePaymentStatus({
    paymentId: payment.id,
    status: "successful",
    confirmedAt: confirmedAt.toISOString(),
    subscriptionId: subscription.id,
  });

  await updateManualPaymentRequestStatus({
    id,
    status: "approved",
    reviewedBy: session.user.id,
    reviewNote,
    paymentId: payment.id,
    subscriptionId: subscription.id,
  });

  await writeAuditLog({
    actorUserId: session.user.id,
    action: "manual_payment.approve",
    entityType: "manual_payment_request",
    entityId: id,
    newValues: {
      userId: request.userId,
      paymentId: payment.id,
      subscriptionId: subscription.id,
    },
  });

  revalidatePath("/admin/paiements-manuels");
  revalidatePath("/admin/paiements");
  revalidatePath("/admin/abonnements");
  revalidatePath("/app/abonnement");
}

export async function rejectManualPaymentAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const reviewNote = String(formData.get("reviewNote") ?? "").trim() || undefined;
  if (!id) throw new Error("ID manquant");

  const request = await getManualPaymentRequest(id);
  if (!request) throw new Error("Demande introuvable");
  if (request.status !== "pending") throw new Error("Demande déjà traitée");

  await updateManualPaymentRequestStatus({
    id,
    status: "rejected",
    reviewedBy: session.user.id,
    reviewNote,
  });

  await writeAuditLog({
    actorUserId: session.user.id,
    action: "manual_payment.reject",
    entityType: "manual_payment_request",
    entityId: id,
    newValues: { reviewNote },
  });

  revalidatePath("/admin/paiements-manuels");
}
