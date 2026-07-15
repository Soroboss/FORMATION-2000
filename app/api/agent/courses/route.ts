import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authorizeAgentRequest, isAgentApiConfigured } from "@/lib/auth/agent-api";
import { writeAuditLog } from "@/lib/audit/write";
import { agentCreateCourseSchema } from "@/lib/validation/agent";
import {
  createAgentDraftCourse,
  listAgentDraftCourses,
} from "@/server/services/agent-catalog";
import { logEvent } from "@/lib/observability/log";

function unauthorized() {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "Clé agent invalide ou manquante." } },
    { status: 401 },
  );
}

function notConfigured() {
  return NextResponse.json(
    {
      error: {
        code: "NOT_CONFIGURED",
        message: "AGENT_API_KEY non configurée (min. 16 caractères).",
      },
    },
    { status: 503 },
  );
}

/**
 * Liste les formations en brouillon (pour Claude Code / scripts).
 * Auth: Authorization: Bearer <AGENT_API_KEY>
 */
export async function GET(request: NextRequest) {
  if (!isAgentApiConfigured()) return notConfigured();
  if (!authorizeAgentRequest(request)) return unauthorized();

  try {
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "30");
    const drafts = await listAgentDraftCourses(Number.isFinite(limit) ? limit : 30);
    return NextResponse.json({ data: drafts });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logEvent({
      level: "error",
      msg: "agent_courses_list_failed",
      route: "/api/agent/courses",
      error: message,
    });
    return NextResponse.json(
      { error: { code: "LIST_FAILED", message } },
      { status: 500 },
    );
  }
}

/**
 * Crée une formation en brouillon uniquement (jamais publiée).
 * Auth: Authorization: Bearer <AGENT_API_KEY>
 */
export async function POST(request: NextRequest) {
  if (!isAgentApiConfigured()) return notConfigured();
  if (!authorizeAgentRequest(request)) return unauthorized();

  const start = Date.now();
  try {
    const body = await request.json();
    const parsed = agentCreateCourseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID",
            message: parsed.error.issues[0]?.message ?? "Données invalides",
            issues: parsed.error.issues.map((i) => ({
              path: i.path.join("."),
              message: i.message,
            })),
          },
        },
        { status: 400 },
      );
    }

    const course = await createAgentDraftCourse(parsed.data);

    await writeAuditLog({
      actorUserId: null,
      action: "agent.course.create_draft",
      entityType: "course",
      entityId: course.id,
      newValues: {
        title: course.title,
        slug: course.slug,
        status: "draft",
        source: "agent_api",
        moduleCount: course.modules.length,
        lessonCount: course.modules.reduce((n, m) => n + m.lessons.length, 0),
      },
    });

    revalidatePath("/admin/formations");
    revalidatePath(`/admin/formations/${course.id}`);

    logEvent({
      level: "info",
      msg: "agent_course_draft_created",
      route: "/api/agent/courses",
      ms: Date.now() - start,
      ok: true,
      courseId: course.id,
    });

    return NextResponse.json(
      {
        data: course,
        meta: {
          message:
            "Formation créée en brouillon. Ouvrez adminUrl pour relire puis publier.",
          publishUrl: course.adminUrl,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logEvent({
      level: "error",
      msg: "agent_course_draft_failed",
      route: "/api/agent/courses",
      ms: Date.now() - start,
      ok: false,
      error: message,
    });
    const status = message.includes("introuvable")
      ? 404
      : message.includes("INSFORGE_SERVICE_KEY")
        ? 503
        : 500;
    return NextResponse.json({ error: { code: "CREATE_FAILED", message } }, { status });
  }
}
