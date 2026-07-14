import { createInsForgeServerClient } from "@/lib/insforge/server";
import { getAccessToken } from "@/lib/auth/cookies";
import { requireAdminSession } from "@/lib/auth/session";

/** Authenticated InsForge client for admin ops (RLS staff policies). */
export async function getAdminDbClient() {
  await requireAdminSession();
  const token = await getAccessToken();
  if (!token) throw new Error("UNAUTHORIZED");
  return createInsForgeServerClient(token);
}

export { slugify } from "@/lib/admin/slug";
