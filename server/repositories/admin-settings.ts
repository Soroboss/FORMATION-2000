import { getAdminDbClient } from "@/lib/admin/client";

export type AppSetting = {
  key: string;
  value: unknown;
  isPublic: boolean;
  updatedAt: string;
};

export async function listSettings(): Promise<AppSetting[]> {
  const client = await getAdminDbClient();
  const { data } = await client.database
    .from("app_settings")
    .select("key, value, is_public, updated_at")
    .order("key", { ascending: true });
  if (!Array.isArray(data)) return [];
  return data.map((row) => ({
    key: String(row.key),
    value: row.value,
    isPublic: Boolean(row.is_public),
    updatedAt: String(row.updated_at),
  }));
}

export async function updateSetting(
  key: string,
  value: unknown,
  updatedBy: string,
): Promise<void> {
  const client = await getAdminDbClient();
  let parsed: unknown = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      parsed = value;
    }
  }
  const { error } = await client.database
    .from("app_settings")
    .update({ value: parsed, updated_by: updatedBy, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) throw new Error(error.message);
}
