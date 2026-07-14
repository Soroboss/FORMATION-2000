import { NextResponse } from "next/server";
import { logEvent } from "@/lib/observability/log";
import { runSubscriptionReminderJob } from "@/server/services/subscription-reminders";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  const start = Date.now();
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await runSubscriptionReminderJob();
    logEvent({
      level: "info",
      msg: "cron_subscription_reminders",
      route: "/api/cron/subscription-reminders",
      ms: Date.now() - start,
      ok: true,
      ...result,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logEvent({
      level: "error",
      msg: "cron_subscription_reminders_failed",
      route: "/api/cron/subscription-reminders",
      ms: Date.now() - start,
      ok: false,
      error: message,
    });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
