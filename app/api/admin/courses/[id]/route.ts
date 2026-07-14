import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit/write";
import { courseUpsertSchema } from "@/lib/validation/admin";
import {
  deleteCourse,
  getAdminCourse,
  upsertCourse,
} from "@/server/repositories/admin-catalog";
import type { CourseStatus } from "@/types/catalog";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    const course = await getAdminCourse(id);
    if (!course) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Formation introuvable" } },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: course });
  } catch (error) {
    const message = error instanceof Error ? error.message : "FORBIDDEN";
    const status = message === "UNAUTHORIZED" ? 401 : 403;
    return NextResponse.json({ error: { code: message, message } }, { status });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = courseUpsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID", message: parsed.error.issues[0]?.message } },
        { status: 400 },
      );
    }
    const course = await upsertCourse({
      id,
      title: parsed.data.title,
      slug: parsed.data.slug,
      shortDescription: parsed.data.shortDescription,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId || undefined,
      level: parsed.data.level || undefined,
      accessType: parsed.data.accessType,
      estimatedDurationMinutes: parsed.data.estimatedDurationMinutes,
      isFeatured: parsed.data.isFeatured,
      status: parsed.data.status as CourseStatus,
    });
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "course.update",
      entityType: "course",
      entityId: id,
    });
    return NextResponse.json({ data: course });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPDATE_FAILED";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: { code: message, message } }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const { id } = await context.params;
    await deleteCourse(id);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "course.delete",
      entityType: "course",
      entityId: id,
    });
    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "DELETE_FAILED";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: { code: message, message } }, { status });
  }
}
