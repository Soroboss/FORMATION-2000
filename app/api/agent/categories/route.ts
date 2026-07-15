import { NextResponse } from "next/server";
import { authorizeAgentRequest, isAgentApiConfigured } from "@/lib/auth/agent-api";
import { listAgentCategories } from "@/server/services/agent-catalog";

/**
 * Liste les catégories (id + slug) pour brancher une formation agent.
 * Auth: Authorization: Bearer <AGENT_API_KEY>
 */
export async function GET(request: Request) {
  if (!isAgentApiConfigured()) {
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
  if (!authorizeAgentRequest(request)) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Clé agent invalide ou manquante." } },
      { status: 401 },
    );
  }

  try {
    const categories = await listAgentCategories();
    return NextResponse.json({ data: categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: { code: "LIST_FAILED", message } },
      { status: 500 },
    );
  }
}
