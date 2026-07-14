import { NextResponse } from "next/server";
import { getCourseById, getCourseBySlug } from "@/server/repositories/catalog";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const start = Date.now();
  const { slug } = await context.params;

  try {
    // Accepte slug ou UUID (compat. ancienne route /api/courses/[id]/curriculum)
    const course = (await getCourseBySlug(slug)) ?? (await getCourseById(slug));

    if (!course) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Curriculum introuvable." } },
        { status: 404 },
      );
    }

    console.log(
      JSON.stringify({
        level: "info",
        msg: "curriculum",
        route: "/api/courses/[slug]/curriculum",
        slug,
        modules: course.modules.length,
        ms: Date.now() - start,
      }),
    );

    return NextResponse.json({
      data: {
        courseId: course.id,
        slug: course.slug,
        modules: course.modules,
      },
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "curriculum_failed",
        route: "/api/courses/[slug]/curriculum",
        slug,
        error: error instanceof Error ? error.message : String(error),
        ms: Date.now() - start,
      }),
    );
    return NextResponse.json(
      { error: { code: "CURRICULUM_FAILED", message: "Impossible de charger le curriculum." } },
      { status: 500 },
    );
  }
}
