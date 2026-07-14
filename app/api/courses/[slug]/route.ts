import { NextResponse } from "next/server";
import { getCourseBySlug } from "@/server/repositories/catalog";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const start = Date.now();
  const { slug } = await context.params;

  try {
    const course = await getCourseBySlug(slug);
    if (!course) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Formation introuvable." } },
        { status: 404 },
      );
    }

    console.log(
      JSON.stringify({
        level: "info",
        msg: "course_detail",
        route: "/api/courses/[slug]",
        slug,
        ms: Date.now() - start,
      }),
    );

    return NextResponse.json({ data: course });
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "course_detail_failed",
        route: "/api/courses/[slug]",
        slug,
        error: error instanceof Error ? error.message : String(error),
        ms: Date.now() - start,
      }),
    );
    return NextResponse.json(
      { error: { code: "COURSE_FAILED", message: "Impossible de charger la formation." } },
      { status: 500 },
    );
  }
}
