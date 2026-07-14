"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/write";
import {
  assignRoleSchema,
  extendSubscriptionSchema,
  memberStatusSchema,
  reviewSubmissionSchema,
  settingUpdateSchema,
} from "@/lib/validation/admin";
import { assignRole, removeRole, updateMemberStatus } from "@/server/repositories/admin-members";
import { extendSubscription } from "@/server/repositories/admin-payments";
import { reviewSubmission } from "@/server/repositories/admin-learning";
import { updateSetting } from "@/server/repositories/admin-settings";
import type { RoleKey } from "@/lib/permissions/roles";

function formString(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

export async function updateMemberStatusAction(formData: FormData): Promise<void> {
  try {
    const session = await requireAdminSession();
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
    await assignRole(parsed.data.userId, parsed.data.roleKey as RoleKey);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "member.role.assign",
      entityType: "user_roles",
      entityId: parsed.data.userId,
      newValues: { role: parsed.data.roleKey },
    });
    revalidatePath("/admin/membres");
    revalidatePath(`/admin/membres/${parsed.data.userId}`);
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
    await removeRole(parsed.data.userId, parsed.data.roleKey as RoleKey);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "member.role.remove",
      entityType: "user_roles",
      entityId: parsed.data.userId,
      newValues: { role: parsed.data.roleKey },
    });
    revalidatePath("/admin/membres");
    revalidatePath(`/admin/membres/${parsed.data.userId}`);
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
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
    revalidatePath("/admin/projets");
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
    return;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}
