import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/write";
import { publishCourse } from "@/server/repositories/admin-catalog";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const { id } = await context.params;
    const course = await publishCourse(id);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "course.publish",
      entityType: "course",
      entityId: id,
    });
    return NextResponse.json({ data: course });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PUBLISH_FAILED";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: { code: message, message } }, { status });
  }
}
