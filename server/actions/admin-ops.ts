"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireAdminSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/write";
import {
  assignRoleSchema,
  activateLearnerAccessSchema,
  extendSubscriptionSchema,
  inviteCollaboratorSchema,
  memberStatusSchema,
  reviewSubmissionSchema,
  settingUpdateSchema,
  updateSupportTicketSchema,
} from "@/lib/validation/admin";
import {
  assignRole,
  countUsersWithRole,
  createCollaborator,
  removeRole,
  updateMemberStatus,
} from "@/server/repositories/admin-members";
import { extendSubscription } from "@/server/repositories/admin-payments";
import { reviewSubmission } from "@/server/repositories/admin-learning";
import { updateSetting } from "@/server/repositories/admin-settings";
import {
  activateOrExtendSubscription,
  getPlanBySlug,
} from "@/server/repositories/payments";
import {
  getSupportTicketForStaff,
  updateSupportTicketStatus,
} from "@/server/repositories/support";
import {
  assertCanAssignRole,
  canManageMemberRoles,
  type RoleKey,
} from "@/lib/permissions/roles";

function formString(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

export async function updateMemberStatusAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    if (!canManageMemberRoles(session.roles)) {
      throw new Error("Permission insuffisante pour modifier le statut d’un membre.");
    }
    const parsed = memberStatusSchema.safeParse({
      userId: formString(formData, "userId"),
      status: formString(formData, "status"),
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
    }
    await updateMemberStatus(parsed.data.userId, parsed.data.status);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "member.status",
      entityType: "profile",
      entityId: parsed.data.userId,
      newValues: { status: parsed.data.status },
    });
    revalidatePath("/admin/membres");
    revalidatePath(`/admin/membres/${parsed.data.userId}`);
    revalidatePath("/admin/parametres");
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function assignRoleAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const parsed = assignRoleSchema.safeParse({
      userId: formString(formData, "userId"),
      roleKey: formString(formData, "roleKey"),
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
    }
    const roleKey = parsed.data.roleKey as RoleKey;
    assertCanAssignRole(session.roles, roleKey);
    await assignRole(parsed.data.userId, roleKey);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "member.role.assign",
      entityType: "user_roles",
      entityId: parsed.data.userId,
      newValues: { role: roleKey },
    });
    revalidatePath("/admin/membres");
    revalidatePath(`/admin/membres/${parsed.data.userId}`);
    revalidatePath("/admin/parametres");
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function removeRoleAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const parsed = assignRoleSchema.safeParse({
      userId: formString(formData, "userId"),
      roleKey: formString(formData, "roleKey"),
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
    }
    const roleKey = parsed.data.roleKey as RoleKey;
    assertCanAssignRole(session.roles, roleKey);

    if (roleKey === "super_admin") {
      const count = await countUsersWithRole("super_admin");
      if (count <= 1) {
        throw new Error("Impossible de retirer le dernier super administrateur.");
      }
    }

    await removeRole(parsed.data.userId, roleKey);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "member.role.remove",
      entityType: "user_roles",
      entityId: parsed.data.userId,
      newValues: { role: roleKey },
    });
    revalidatePath("/admin/membres");
    revalidatePath(`/admin/membres/${parsed.data.userId}`);
    revalidatePath("/admin/parametres");
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export type InviteCollaboratorState = {
  ok: boolean;
  message: string;
  memberId?: string;
  email?: string;
};

export async function inviteCollaboratorAction(
  _prev: InviteCollaboratorState,
  formData: FormData,
): Promise<InviteCollaboratorState> {
  try {
    const session = await requireAdminSession();
    if (!canManageMemberRoles(session.roles)) {
      return {
        ok: false,
        message: "Seuls les administrateurs peuvent créer des collaborateurs.",
      };
    }

    const parsed = inviteCollaboratorSchema.safeParse({
      firstName: formString(formData, "firstName"),
      lastName: formString(formData, "lastName"),
      email: formString(formData, "email").toLowerCase(),
      password: String(formData.get("password") ?? ""),
      roleKey: formString(formData, "roleKey"),
      whatsapp: formString(formData, "whatsapp"),
    });
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Données invalides",
      };
    }

    assertCanAssignRole(session.roles, parsed.data.roleKey);

    const member = await createCollaborator({
      email: parsed.data.email,
      password: parsed.data.password,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      whatsapp: parsed.data.whatsapp || undefined,
      roleKey: parsed.data.roleKey,
    });

    await writeAuditLog({
      actorUserId: session.user.id,
      action: "member.collaborator.create",
      entityType: "profile",
      entityId: member.id,
      newValues: { email: member.email, role: parsed.data.roleKey },
    });

    revalidatePath("/admin/membres");
    revalidatePath(`/admin/membres/${member.id}`);
    revalidatePath("/admin/parametres");

    return {
      ok: true,
      message: `Collaborateur créé : ${member.email}. Il peut se connecter avec le mot de passe défini.`,
      memberId: member.id,
      email: member.email ?? undefined,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Création impossible",
    };
  }
}

export async function extendSubscriptionAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const parsed = extendSubscriptionSchema.safeParse({
      subscriptionId: formString(formData, "subscriptionId"),
      days: formString(formData, "days") || 30,
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
    }
    const sub = await extendSubscription(parsed.data.subscriptionId, parsed.data.days);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "subscription.extend",
      entityType: "subscription",
      entityId: sub.id,
      newValues: { days: parsed.data.days, endsAt: sub.endsAt },
    });
    revalidatePath("/admin/abonnements");
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Active ou prolonge l’accès premium d’un apprenant depuis sa fiche admin
 * (paiement reçu hors plateforme, faveur, test, etc.).
 */
export async function activateLearnerAccessAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const parsed = activateLearnerAccessSchema.safeParse({
      userId: formString(formData, "userId"),
      days: formString(formData, "days") || 30,
      note: formString(formData, "note"),
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
    }

    const plan = await getPlanBySlug("acces-mensuel");
    if (!plan) {
      throw new Error("Plan « acces-mensuel » introuvable. Vérifiez la migration des plans.");
    }

    const subscription = await activateOrExtendSubscription({
      userId: parsed.data.userId,
      planId: plan.id,
      durationDays: parsed.data.days,
      confirmedAt: new Date(),
      source: `admin_grant:${session.user.id}`,
    });

    await writeAuditLog({
      actorUserId: session.user.id,
      action: "member.access.activate",
      entityType: "subscription",
      entityId: subscription.id,
      newValues: {
        userId: parsed.data.userId,
        days: parsed.data.days,
        endsAt: subscription.endsAt,
        note: parsed.data.note || null,
      },
    });

    const { notifyUser } = await import("@/server/services/notify");
    await notifyUser({
      userId: parsed.data.userId,
      type: "subscription_activated",
      title: "Accès formations activé",
      message: subscription.endsAt
        ? `Votre accès premium est actif jusqu’au ${new Date(subscription.endsAt).toLocaleDateString("fr-FR")}.`
        : "Votre accès premium est maintenant actif.",
      actionUrl: "/app/catalogue",
    });

    revalidatePath(`/admin/membres/${parsed.data.userId}`);
    revalidatePath("/admin/membres");
    revalidatePath("/admin/abonnements");
    revalidatePath("/app");
    revalidatePath("/app/notifications");
    redirect(`/admin/membres/${parsed.data.userId}?access=1`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function reviewSubmissionAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const parsed = reviewSubmissionSchema.safeParse({
      submissionId: formString(formData, "submissionId"),
      status: formString(formData, "status"),
      score: formString(formData, "score") || undefined,
      reviewComment: formString(formData, "reviewComment"),
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
    }
    const submission = await reviewSubmission({
      submissionId: parsed.data.submissionId,
      reviewerId: session.user.id,
      status: parsed.data.status,
      score: parsed.data.score,
      reviewComment: parsed.data.reviewComment,
    });
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "submission.review",
      entityType: "assignment_submission",
      entityId: submission.id,
      newValues: { status: submission.status, score: submission.score },
    });

    const statusLabel =
      submission.status === "approved"
        ? "validé"
        : submission.status === "rejected"
          ? "refusé"
          : "à corriger";
    const scorePart =
      submission.score != null ? ` Note : ${submission.score}/100.` : "";
    const commentPart = submission.reviewComment
      ? ` Commentaire : ${submission.reviewComment}`
      : "";

    const { notifyUser } = await import("@/server/services/notify");
    await notifyUser({
      userId: submission.userId,
      type: "project_reviewed",
      title: `Exercice ${statusLabel}`,
      message: `Votre exercice a été ${statusLabel}.${scorePart}${commentPart}`,
      actionUrl: "/app/projets",
    });

    revalidatePath("/admin/projets");
    revalidatePath("/app/projets");
    revalidatePath("/app/notifications");
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function updateSupportTicketAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const parsed = updateSupportTicketSchema.safeParse({
      ticketId: formString(formData, "ticketId"),
      status: formString(formData, "status"),
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
    }
    const result = await updateSupportTicketStatus({
      ticketId: parsed.data.ticketId,
      status: parsed.data.status,
      actorUserId: session.user.id,
    });
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "support.ticket.status",
      entityType: "support_ticket",
      entityId: parsed.data.ticketId,
      newValues: { status: parsed.data.status },
    });

    if (result.userId) {
      const statusLabel: Record<string, string> = {
        open: "ouvert",
        in_progress: "en cours",
        resolved: "résolu",
        closed: "fermé",
      };
      const { notifyUser } = await import("@/server/services/notify");
      await notifyUser({
        userId: result.userId,
        type: "support_update",
        title: "Mise à jour support",
        message: `Votre ticket est maintenant « ${statusLabel[parsed.data.status] ?? parsed.data.status} ».`,
        actionUrl: `/app/support/${parsed.data.ticketId}`,
      });
    }
    revalidatePath("/admin/support");
    revalidatePath(`/admin/support/${parsed.data.ticketId}`);
    revalidatePath("/app/support");
    revalidatePath(`/app/support/${parsed.data.ticketId}`);
    revalidatePath("/app/notifications");
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function replySupportTicketAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const ticketId = formString(formData, "ticketId");
    const message = formString(formData, "message").trim();
    if (!ticketId || message.length < 2) {
      throw new Error("Message trop court");
    }
    if (message.length > 5000) throw new Error("Message trop long");

    const ticket = await getSupportTicketForStaff(ticketId);
    if (!ticket) throw new Error("Ticket introuvable");

    const { addSupportMessage } = await import("@/server/repositories/support");
    await addSupportMessage({
      ticketId,
      senderId: session.user.id,
      message,
      isInternal: false,
    });

    if (ticket.status === "open") {
      await updateSupportTicketStatus({
        ticketId,
        status: "in_progress",
        actorUserId: session.user.id,
      });
    }

    await writeAuditLog({
      actorUserId: session.user.id,
      action: "support.ticket.reply",
      entityType: "support_ticket",
      entityId: ticketId,
    });

    if (ticket.userId) {
      const { notifyUser } = await import("@/server/services/notify");
      await notifyUser({
        userId: ticket.userId,
        type: "support_reply",
        title: "Réponse du support",
        message: `Nouvelle réponse sur « ${ticket.subject} ».`,
        actionUrl: `/app/support/${ticketId}`,
      });
    }

    revalidatePath("/admin/support");
    revalidatePath(`/admin/support/${ticketId}`);
    revalidatePath("/app/support");
    revalidatePath(`/app/support/${ticketId}`);
    revalidatePath("/app/notifications");
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function updateSettingAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const parsed = settingUpdateSchema.safeParse({
      key: formString(formData, "key"),
      value: formString(formData, "value"),
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
    }
    await updateSetting(parsed.data.key, parsed.data.value, session.user.id);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "settings.update",
      entityType: "app_settings",
      entityId: parsed.data.key,
    });
    revalidatePath("/admin/parametres");
    revalidatePath("/paiement/manuel");
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function updateManualPaymentConfigAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
    const contacts = [0, 1, 2]
      .map((i) => ({
        label: formString(formData, `contact_${i}_label`),
        number: formString(formData, `contact_${i}_number`).replace(/\s+/g, ""),
        name: formString(formData, `contact_${i}_name`) || undefined,
      }))
      .filter((c) => c.label && c.number);

    const value = {
      enabled: formData.get("enabled") === "on" || formData.get("enabled") === "true",
      whatsapp: formString(formData, "whatsapp").replace(/\D/g, ""),
      whatsappMessage: formString(formData, "whatsappMessage"),
      instructions: formString(formData, "instructions"),
      contacts,
    };

    if (!value.whatsappMessage) {
      throw new Error("Le message WhatsApp est requis");
    }
    if (!value.instructions) {
      throw new Error("Les consignes de paiement sont requises");
    }

    await updateSetting("manual_payment.config", value, session.user.id);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "settings.update",
      entityType: "app_settings",
      entityId: "manual_payment.config",
      newValues: { enabled: value.enabled, contacts: value.contacts.length },
    });
    revalidatePath("/admin/parametres");
    revalidatePath("/paiement/manuel");
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}
