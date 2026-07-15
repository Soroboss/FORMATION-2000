import { timingSafeEqual } from "node:crypto";

/**
 * Auth Bearer pour l’API agent (Claude Code / scripts).
 * Secret serveur uniquement — jamais NEXT_PUBLIC_*.
 */
export function getAgentApiKey(): string | null {
  const key = process.env.AGENT_API_KEY?.trim();
  return key && key.length >= 16 ? key : null;
}

export function isAgentApiConfigured(): boolean {
  return Boolean(getAgentApiKey());
}

function safeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Extrait et vérifie `Authorization: Bearer <AGENT_API_KEY>`. */
export function authorizeAgentRequest(request: Request): boolean {
  const expected = getAgentApiKey();
  if (!expected) return false;

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  const token = header.slice("Bearer ".length).trim();
  if (!token) return false;

  return safeEqualString(token, expected);
}
