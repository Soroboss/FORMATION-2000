import { tryCreateInsForgeServiceClient } from "@/lib/insforge/server";
import type { Plan } from "@/types/payments";

function service() {
  const client = tryCreateInsForgeServiceClient();
  if (!client) throw new Error("INSFORGE_SERVICE_KEY is required for plan administration.");
  return client;
}

const PLAN_COLUMNS =
  "id, name, slug, description, price_amount, currency, duration_days, is_active, features";

function mapPlan(row: Record<string, unknown>): Plan {
  const features = Array.isArray(row.features)
    ? row.features.filter((f): f is string => typeof f === "string")
    : [];
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: (row.description as string | null) ?? null,
    priceAmount: Number(row.price_amount),
    currency: String(row.currency ?? "XOF"),
    durationDays: Number(row.duration_days ?? 30),
    isActive: Boolean(row.is_active),
    features,
  };
}

export async function listPlansAdmin(): Promise<Plan[]> {
  const client = service();
  const { data } = await client.database
    .from("plans")
    .select(PLAN_COLUMNS)
    .order("price_amount", { ascending: true });
  if (!Array.isArray(data)) return [];
  return data.map((row) => mapPlan(row as Record<string, unknown>));
}

export async function createPlan(input: {
  name: string;
  slug: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  durationDays: number;
  features: string[];
}): Promise<void> {
  const client = service();
  const { error } = await client.database.from("plans").insert([
    {
      name: input.name,
      slug: input.slug,
      description: input.description,
      price_amount: input.priceAmount,
      currency: input.currency,
      duration_days: input.durationDays,
      features: input.features,
      is_active: true,
    },
  ]);
  if (error) throw new Error(error.message);
}

export async function updatePlan(
  id: string,
  patch: {
    name?: string;
    description?: string | null;
    priceAmount?: number;
    currency?: string;
    durationDays?: number;
    features?: string[];
  },
): Promise<void> {
  const client = service();
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.priceAmount !== undefined) update.price_amount = patch.priceAmount;
  if (patch.currency !== undefined) update.currency = patch.currency;
  if (patch.durationDays !== undefined) update.duration_days = patch.durationDays;
  if (patch.features !== undefined) update.features = patch.features;
  if (Object.keys(update).length === 0) return;
  const { error } = await client.database.from("plans").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setPlanActive(id: string, isActive: boolean): Promise<void> {
  const client = service();
  const { error } = await client.database.from("plans").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
}
