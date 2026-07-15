"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession, requireSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/write";
import {
  errorMessage,
  redirectWithFlash,
  rethrowRedirect,
  safeReturnPath,
} from "@/lib/action-feedback";
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
  const back = safeReturnPath(
    String(formData.get("returnTo") ?? "").trim(),
    "/paiement/manuel",
  );
  try {
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
      redirectWithFlash(
        back,
        "error",
        parsed.error.issues[0]?.message ?? "Données invalides",
      );
    }

    const plan =
      (parsed.data.planSlug ? await getPlanBySlug(parsed.data.planSlug) : null) ??
      (await getPlanBySlug("acces-mensuel"));
    if (!plan) {
      redirectWithFlash(back, "error", "Plan introuvable");
    }

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
    redirectWithFlash(back, "ok", "Demande envoyée — en attente de validation");
  } catch (error) {
    rethrowRedirect(error);
    redirectWithFlash(back, "error", errorMessage(error));
  }
}

export async function approveManualPaymentAction(formData: FormData): Promise<void> {
  const back = safeReturnPath(
    String(formData.get("returnTo") ?? "").trim(),
    "/admin/paiements-manuels",
  );
  try {
    const session = await requireAdminSession();
    const id = String(formData.get("id") ?? "");
    const reviewNote = String(formData.get("reviewNote") ?? "").trim() || undefined;
    if (!id) {
      redirectWithFlash(back, "error", "ID manquant");
    }

    const request = await getManualPaymentRequest(id);
    if (!request) {
      redirectWithFlash(back, "error", "Demande introuvable");
    }
    if (request.status !== "pending") {
      redirectWithFlash(back, "error", "Demande déjà traitée");
    }

    const plan =
      (request.planId ? await getPlanById(request.planId) : null) ??
      (await getPlanBySlug("acces-mensuel"));
    if (!plan) {
      redirectWithFlash(back, "error", "Plan introuvable");
    }

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

    const { notifyUser } = await import("@/server/services/notify");
    await notifyUser({
      userId: request.userId,
      type: "payment_approved",
      title: "Paiement validé",
      message: subscription.endsAt
        ? `Votre paiement Mobile Money a été confirmé. Accès premium actif jusqu’au ${new Date(subscription.endsAt).toLocaleDateString("fr-FR")}.`
        : "Votre paiement Mobile Money a été confirmé. Accès premium activé.",
      actionUrl: "/app/abonnement",
    });

    revalidatePath("/admin/paiements-manuels");
    revalidatePath("/admin/paiements");
    revalidatePath("/admin/abonnements");
    revalidatePath("/app/abonnement");
    revalidatePath("/app/notifications");
    redirectWithFlash(back, "ok", "Paiement validé");
  } catch (error) {
    rethrowRedirect(error);
    redirectWithFlash(back, "error", errorMessage(error));
  }
}

export async function rejectManualPaymentAction(formData: FormData): Promise<void> {
  const back = safeReturnPath(
    String(formData.get("returnTo") ?? "").trim(),
    "/admin/paiements-manuels",
  );
  try {
    const session = await requireAdminSession();
    const id = String(formData.get("id") ?? "");
    const reviewNote = String(formData.get("reviewNote") ?? "").trim() || undefined;
    if (!id) {
      redirectWithFlash(back, "error", "ID manquant");
    }

    const request = await getManualPaymentRequest(id);
    if (!request) {
      redirectWithFlash(back, "error", "Demande introuvable");
    }
    if (request.status !== "pending") {
      redirectWithFlash(back, "error", "Demande déjà traitée");
    }

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

    const { notifyUser } = await import("@/server/services/notify");
    await notifyUser({
      userId: request.userId,
      type: "payment_rejected",
      title: "Paiement non validé",
      message: reviewNote
        ? `Votre demande de paiement a été refusée. Motif : ${reviewNote}`
        : "Votre demande de paiement a été refusée. Contactez le support ou renvoyez une preuve.",
      actionUrl: "/paiement/manuel",
    });

    revalidatePath("/admin/paiements-manuels");
    revalidatePath("/app/notifications");
    redirectWithFlash(back, "ok", "Demande refusée");
  } catch (error) {
    rethrowRedirect(error);
    redirectWithFlash(back, "error", errorMessage(error));
  }
}
