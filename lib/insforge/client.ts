import { createClient, type InsForgeClient } from "@insforge/sdk";

let browserClient: InsForgeClient | null = null;

/**
 * Browser InsForge client — anon key only.
 * Prefer server actions for auth; use this only for non-sensitive client reads.
 */
export function createInsForgeBrowserClient(): InsForgeClient {
  if (browserClient) return browserClient;

  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error("InsForge public env vars are not configured.");
  }

  browserClient = createClient({ baseUrl, anonKey });
  return browserClient;
}
