import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/write";
import { extendSubscriptionSchema } from "@/lib/validation/admin";
import { extendSubscription } from "@/server/repositories/admin-payments";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const parsed = extendSubscriptionSchema.safeParse({
      subscriptionId: id,
      days: (body as { days?: number }).days ?? 30,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID", message: parsed.error.issues[0]?.message } },
        { status: 400 },
      );
    }
    const sub = await extendSubscription(parsed.data.subscriptionId, parsed.data.days);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "subscription.extend",
      entityType: "subscription",
      entityId: id,
      newValues: { days: parsed.data.days, endsAt: sub.endsAt },
    });
    return NextResponse.json({ data: sub });
  } catch (error) {
    const message = error instanceof Error ? error.message : "EXTEND_FAILED";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: { code: message, message } }, { status });
  }
}
