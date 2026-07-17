"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/session";
import { hasAnyRole } from "@/lib/permissions/roles";
import {
  getAdminPayment,
  markPaymentRefunded,
  markSubscriptionRefunded,
} from "@/server/repositories/admin-payments";
import { getPaymentProvider } from "@/lib/payments/provider";
import { writeAuditLog } from "@/lib/audit/write";

export async function refundPaymentAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  if (!hasAnyRole(session.roles, ["admin", "super_admin"])) {
    throw new Error("FORBIDDEN");
  }

  const paymentId = String(formData.get("paymentId") ?? "").trim();
  if (!paymentId) return;

  const payment = await getAdminPayment(paymentId);
  if (!payment) throw new Error("Paiement introuvable.");
  if (payment.status !== "successful") {
    throw new Error("Seul un paiement encaissé peut être remboursé.");
  }

  // Tentative de remboursement côté fournisseur (best-effort : les PSP réels
  // exigent des clés ; l'échec ne bloque pas le remboursement manuel enregistré).
  let providerStatus = "manual";
  try {
    const provider = getPaymentProvider();
    if (provider.refundPayment && payment.providerReference) {
      const result = await provider.refundPayment(payment.providerReference);
      providerStatus = result.status;
    }
  } catch {
    providerStatus = "provider_error";
  }

  await markPaymentRefunded(paymentId);
  if (payment.subscriptionId) {
    await markSubscriptionRefunded(payment.subscriptionId);
  }

  await writeAuditLog({
    actorUserId: session.user.id,
    action: "payment.refund",
    entityType: "payment",
    entityId: paymentId,
    newValues: {
      amount: payment.amount,
      currency: payment.currency,
      providerStatus,
      subscriptionRevoked: Boolean(payment.subscriptionId),
    },
  });

  revalidatePath("/admin/paiements");
  revalidatePath("/admin/finances");
}
