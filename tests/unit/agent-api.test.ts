import { describe, expect, it, afterEach } from "vitest";
import { authorizeAgentRequest, isAgentApiConfigured } from "@/lib/auth/agent-api";
import { agentCreateCourseSchema } from "@/lib/validation/agent";

describe("agent API auth", () => {
  const prev = process.env.AGENT_API_KEY;

  afterEach(() => {
    if (prev === undefined) delete process.env.AGENT_API_KEY;
    else process.env.AGENT_API_KEY = prev;
  });

  it("refuse si AGENT_API_KEY absente ou trop courte", () => {
    delete process.env.AGENT_API_KEY;
    expect(isAgentApiConfigured()).toBe(false);
    process.env.AGENT_API_KEY = "short";
    expect(isAgentApiConfigured()).toBe(false);
  });

  it("accepte un Bearer valide", () => {
    process.env.AGENT_API_KEY = "1234567890123456-secret";
    expect(isAgentApiConfigured()).toBe(true);
    const req = new Request("https://example.com/api/agent/courses", {
      headers: { Authorization: "Bearer 1234567890123456-secret" },
    });
    expect(authorizeAgentRequest(req)).toBe(true);
  });

  it("refuse un Bearer incorrect", () => {
    process.env.AGENT_API_KEY = "1234567890123456-secret";
    const req = new Request("https://example.com/api/agent/courses", {
      headers: { Authorization: "Bearer wrong-key-wrong-key" },
    });
    expect(authorizeAgentRequest(req)).toBe(false);
  });
});

describe("agentCreateCourseSchema", () => {
  it("accepte un payload minimal avec youtubeUrl", () => {
    const parsed = agentCreateCourseSchema.safeParse({
      title: "Intro IA",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categorySlug: "intelligence-artificielle",
    });
    expect(parsed.success).toBe(true);
  });

  it("refuse un lien YouTube invalide", () => {
    const parsed = agentCreateCourseSchema.safeParse({
      title: "Intro IA",
      youtubeUrl: "https://example.com/not-youtube",
    });
    expect(parsed.success).toBe(false);
  });

  it("refuse categoryId + categorySlug ensemble", () => {
    const parsed = agentCreateCourseSchema.safeParse({
      title: "Intro IA",
      categoryId: "11111111-1111-4111-8111-111111111101",
      categorySlug: "intelligence-artificielle",
    });
    expect(parsed.success).toBe(false);
  });

  it("n’expose pas de champ status publiable", () => {
    const parsed = agentCreateCourseSchema.safeParse({
      title: "Formation test",
      status: "published",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect("status" in parsed.data).toBe(false);
    }
  });
});
