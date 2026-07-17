"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/session";
import { hasAnyRole } from "@/lib/permissions/roles";
import { slugify } from "@/lib/admin/slug";
import { writeAuditLog } from "@/lib/audit/write";
import {
  createPlan,
  setPlanActive,
  updatePlan,
} from "@/server/repositories/admin-plans";

export type PlanActionResult = { success: boolean; error?: string };

function parseFeatures(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseAmount(value: FormDataEntryValue | null): number {
  const n = Number(String(value ?? "").trim());
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
}

async function requirePlanManager() {
  const session = await requireAdminSession();
  if (!hasAnyRole(session.roles, ["admin", "super_admin"])) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function createPlanAction(formData: FormData): Promise<PlanActionResult> {
  try {
    const session = await requirePlanManager();
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { success: false, error: "Le nom est requis." };
    const slug = slugify(String(formData.get("slug") ?? "").trim() || name);
    const durationDays = Math.max(1, parseAmount(formData.get("durationDays")) || 30);

    await createPlan({
      name,
      slug,
      description: String(formData.get("description") ?? "").trim() || null,
      priceAmount: parseAmount(formData.get("priceAmount")),
      currency: String(formData.get("currency") ?? "XOF").trim().toUpperCase() || "XOF",
      durationDays,
      features: parseFeatures(formData.get("features")),
    });

    await writeAuditLog({
      actorUserId: session.user.id,
      action: "plan.create",
      entityType: "plan",
      newValues: { name, slug },
    });
    revalidatePath("/admin/offres");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error && error.message.toLowerCase().includes("duplicate")
        ? "Ce slug d'offre existe déjà."
        : "Création de l'offre impossible.";
    return { success: false, error: message };
  }
}

export async function updatePlanAction(formData: FormData): Promise<void> {
  const session = await requirePlanManager();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await updatePlan(id, {
    name: String(formData.get("name") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || null,
    priceAmount: parseAmount(formData.get("priceAmount")),
    currency: String(formData.get("currency") ?? "XOF").trim().toUpperCase() || "XOF",
    durationDays: Math.max(1, parseAmount(formData.get("durationDays")) || 30),
    features: parseFeatures(formData.get("features")),
  });
  await writeAuditLog({
    actorUserId: session.user.id,
    action: "plan.update",
    entityType: "plan",
    entityId: id,
  });
  revalidatePath("/admin/offres");
}

export async function togglePlanAction(formData: FormData): Promise<void> {
  const session = await requirePlanManager();
  const id = String(formData.get("id") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "") === "true";
  if (!id) return;
  await setPlanActive(id, isActive);
  await writeAuditLog({
    actorUserId: session.user.id,
    action: isActive ? "plan.activate" : "plan.deactivate",
    entityType: "plan",
    entityId: id,
  });
  revalidatePath("/admin/offres");
}
