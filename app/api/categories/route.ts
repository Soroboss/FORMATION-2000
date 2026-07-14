import { NextResponse } from "next/server";
import { listCategories } from "@/server/repositories/catalog";

export async function GET() {
  const start = Date.now();
  try {
    const categories = await listCategories();
    console.log(
      JSON.stringify({
        level: "info",
        msg: "categories_list",
        route: "/api/categories",
        count: categories.length,
        ms: Date.now() - start,
      }),
    );
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "categories_list_failed",
        route: "/api/categories",
        error: error instanceof Error ? error.message : String(error),
        ms: Date.now() - start,
      }),
    );
    return NextResponse.json(
      { error: { code: "CATEGORIES_FAILED", message: "Impossible de charger les catégories." } },
      { status: 500 },
    );
  }
}
