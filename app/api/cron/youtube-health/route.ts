import { NextResponse } from "next/server";
import { logEvent } from "@/lib/observability/log";
import { runYoutubeHealthJob } from "@/server/services/youtube-health";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
    const result = await runYoutubeHealthJob();
    logEvent({
      level: "info",
      msg: "cron_youtube_health",
      route: "/api/cron/youtube-health",
      ms: Date.now() - start,
      ok: true,
      ...result,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logEvent({
      level: "error",
      msg: "cron_youtube_health_failed",
      route: "/api/cron/youtube-health",
      ms: Date.now() - start,
      ok: false,
      error: message,
    });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
