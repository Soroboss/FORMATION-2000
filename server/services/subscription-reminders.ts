import { tryCreateInsForgeServiceClient } from "@/lib/insforge/server";
import { notifyUser } from "@/server/services/notify";

export type ReminderType = "expires_in_7d" | "expires_in_3d" | "expires_in_1d" | "expired";

type SubscriptionRow = {
  id: string;
  user_id: string;
  status: string;
  ends_at: string | null;
};

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addUtcDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function endsAtInDaysWindow(endsAt: Date, now: Date, days: number): boolean {
  const target = addUtcDays(startOfUtcDay(now), days);
  const end = addUtcDays(target, 1);
  return endsAt >= target && endsAt < end;
}

async function alreadySent(
  subscriptionId: string,
  reminderType: ReminderType,
): Promise<boolean> {
  const client = tryCreateInsForgeServiceClient();
  if (!client) return true;
  const { data } = await client.database
    .from("subscription_reminder_logs")
    .select("id")
    .eq("subscription_id", subscriptionId)
    .eq("reminder_type", reminderType)
    .maybeSingle();
  return Boolean(data);
}

async function markSent(subscriptionId: string, reminderType: ReminderType): Promise<void> {
  const client = tryCreateInsForgeServiceClient();
  if (!client) return;
  await client.database.from("subscription_reminder_logs").insert({
    subscription_id: subscriptionId,
    reminder_type: reminderType,
  });
}

async function notifyExpiry(input: {
  userId: string;
  subscriptionId: string;
  reminderType: ReminderType;
  endsAt: Date;
}): Promise<boolean> {
  if (await alreadySent(input.subscriptionId, input.reminderType)) {
    return false;
  }

  const dateLabel = input.endsAt.toLocaleDateString("fr-FR");
  const copy: Record<ReminderType, { title: string; message: string }> = {
    expires_in_7d: {
      title: "Abonnement — expiration dans 7 jours",
      message: `Votre accès premium expire le ${dateLabel}. Renouvelez pour continuer sans interruption.`,
    },
    expires_in_3d: {
      title: "Abonnement — expiration dans 3 jours",
      message: `Plus que 3 jours : votre accès expire le ${dateLabel}.`,
    },
    expires_in_1d: {
      title: "Abonnement — expire demain",
      message: `Dernier rappel : votre accès expire demain (${dateLabel}).`,
    },
    expired: {
      title: "Abonnement expiré",
      message:
        "Votre accès premium est expiré. Renouvelez pour retrouver les formations et exercices.",
    },
  };

  const payload = copy[input.reminderType];
  await notifyUser({
    userId: input.userId,
    type: input.reminderType,
    title: payload.title,
    message: payload.message,
    actionUrl: "/app/abonnement",
  });

  await markSent(input.subscriptionId, input.reminderType);
  return true;
}

export async function runSubscriptionReminderJob(now = new Date()): Promise<{
  expiredMarked: number;
  remindersSent: number;
  checked: number;
}> {
  const client = tryCreateInsForgeServiceClient();
  if (!client) {
    throw new Error("INSFORGE_SERVICE_KEY requis pour le cron d’expiration");
  }

  let expiredMarked = 0;
  let remindersSent = 0;

  // 1) Mark overdue active/grace subscriptions as expired
  const { data: overdue } = await client.database
    .from("subscriptions")
    .select("id, user_id, status, ends_at")
    .in("status", ["active", "grace_period"])
    .lt("ends_at", now.toISOString())
    .limit(500);

  const overdueRows = Array.isArray(overdue) ? (overdue as SubscriptionRow[]) : [];
  for (const row of overdueRows) {
    await client.database
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("id", row.id)
      .in("status", ["active", "grace_period"]);
    expiredMarked += 1;

    const endsAt = row.ends_at ? new Date(row.ends_at) : now;
    if (
      await notifyExpiry({
        userId: row.user_id,
        subscriptionId: row.id,
        reminderType: "expired",
        endsAt,
      })
    ) {
      remindersSent += 1;
    }
  }

  // 2) Upcoming expirations on still-active subscriptions
  const { data: active } = await client.database
    .from("subscriptions")
    .select("id, user_id, status, ends_at")
    .in("status", ["active", "grace_period"])
    .not("ends_at", "is", null)
    .limit(1000);

  const activeRows = Array.isArray(active) ? (active as SubscriptionRow[]) : [];
  const checked = activeRows.length + overdueRows.length;

  for (const row of activeRows) {
    if (!row.ends_at) continue;
    const endsAt = new Date(row.ends_at);
    const windows: Array<{ days: number; type: ReminderType }> = [
      { days: 7, type: "expires_in_7d" },
      { days: 3, type: "expires_in_3d" },
      { days: 1, type: "expires_in_1d" },
    ];
    for (const window of windows) {
      if (!endsAtInDaysWindow(endsAt, now, window.days)) continue;
      if (
        await notifyExpiry({
          userId: row.user_id,
          subscriptionId: row.id,
          reminderType: window.type,
          endsAt,
        })
      ) {
        remindersSent += 1;
      }
    }
  }

  return { expiredMarked, remindersSent, checked };
}
