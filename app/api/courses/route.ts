import { NextRequest, NextResponse } from "next/server";
import { listCourses } from "@/server/repositories/catalog";
import type { CourseLevel } from "@/types/catalog";

export async function GET(request: NextRequest) {
  const start = Date.now();
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim() || undefined;
    const categorySlug = searchParams.get("category")?.trim() || undefined;
    const levelParam = searchParams.get("level");
    const level =
      levelParam === "beginner" ||
      levelParam === "intermediate" ||
      levelParam === "advanced"
        ? (levelParam as CourseLevel)
        : undefined;
    const featured = searchParams.get("featured") === "true";

    const courses = await listCourses({ q, categorySlug, level, featured });
    console.log(
      JSON.stringify({
        level: "info",
        msg: "courses_list",
        route: "/api/courses",
        count: courses.length,
        ms: Date.now() - start,
      }),
    );
    return NextResponse.json({ data: courses });
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "courses_list_failed",
        route: "/api/courses",
        error: error instanceof Error ? error.message : String(error),
        ms: Date.now() - start,
      }),
    );
    return NextResponse.json(
      { error: { code: "COURSES_FAILED", message: "Impossible de charger les formations." } },
      { status: 500 },
    );
  }
}
