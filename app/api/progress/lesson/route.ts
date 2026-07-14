import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getCourseById, getCourseBySlug, getLessonDetail } from "@/server/repositories/catalog";
import {
  ensureEnrollment,
  recalculateEnrollmentProgress,
  upsertLessonProgress,
} from "@/server/repositories/learning";
import { canAccessPremiumContent, canWatchLesson } from "@/lib/subscriptions/access";

export async function POST(request: NextRequest) {
  const start = Date.now();
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Connexion requise." } },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      courseSlug?: string;
      lessonId?: string;
      action?: "start" | "update" | "complete";
      lastPositionSeconds?: number;
      progressPercent?: number;
    };

    if (!body.courseSlug || !body.lessonId || !body.action) {
      return NextResponse.json(
        { error: { code: "INVALID_BODY", message: "Payload invalide." } },
        { status: 400 },
      );
    }

    const detail = await getLessonDetail({
      courseSlug: body.courseSlug,
      lessonId: body.lessonId,
    });
    if (!detail) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Leçon introuvable." } },
        { status: 404 },
      );
    }

    const hasPremium = await canAccessPremiumContent(session.user.id);
    const allowed = canWatchLesson({
      isPreview: detail.lesson.isPreview,
      courseAccessType: detail.course.accessType,
      hasPremiumAccess: hasPremium,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Accès refusé." } },
        { status: 403 },
      );
    }

    await ensureEnrollment(session.user.id, detail.course.id);

    let progress;
    if (body.action === "start") {
      progress = await upsertLessonProgress({
        userId: session.user.id,
        lessonId: detail.lesson.id,
        status: "in_progress",
        progressPercent: 10,
      });
    } else if (body.action === "update") {
      progress = await upsertLessonProgress({
        userId: session.user.id,
        lessonId: detail.lesson.id,
        status: "in_progress",
        progressPercent: Math.min(99, Math.max(10, body.progressPercent ?? 20)),
        lastPositionSeconds: body.lastPositionSeconds,
      });
    } else {
      progress = await upsertLessonProgress({
        userId: session.user.id,
        lessonId: detail.lesson.id,
        status: "completed",
        progressPercent: 100,
        lastPositionSeconds: body.lastPositionSeconds,
      });

      const requiredLessonIds = detail.course.modules
        .flatMap((m) => m.lessons)
        .filter((l) => l.isRequired)
        .map((l) => l.id);

      await recalculateEnrollmentProgress({
        userId: session.user.id,
        courseId: detail.course.id,
        requiredLessonIds,
        lastLessonId: detail.lesson.id,
      });
    }

    console.log(
      JSON.stringify({
        level: "info",
        msg: "progress_updated",
        route: "/api/progress/lesson",
        action: body.action,
        lessonId: body.lessonId,
        ms: Date.now() - start,
      }),
    );

    return NextResponse.json({ data: progress });
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "progress_failed",
        route: "/api/progress/lesson",
        error: error instanceof Error ? error.message : String(error),
        ms: Date.now() - start,
      }),
    );
    return NextResponse.json(
      { error: { code: "PROGRESS_FAILED", message: "Impossible de mettre à jour la progression." } },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const courseId = request.nextUrl.searchParams.get("courseId");
  const courseSlug = request.nextUrl.searchParams.get("courseSlug");
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Connexion requise." } },
      { status: 401 },
    );
  }

  const course = courseSlug
    ? await getCourseBySlug(courseSlug)
    : courseId
      ? await getCourseById(courseId)
      : null;

  if (!course) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Formation introuvable." } },
      { status: 404 },
    );
  }

  const { listEnrollmentsForUser, listLessonProgressForCourse } = await import(
    "@/server/repositories/learning"
  );
  const enrollments = await listEnrollmentsForUser(session.user.id);
  const enrollment = enrollments.find((e) => e.courseId === course.id) ?? null;
  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const progress = await listLessonProgressForCourse(session.user.id, lessonIds);

  return NextResponse.json({ data: { enrollment, progress } });
}
