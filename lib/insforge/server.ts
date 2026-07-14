import { createClient, type InsForgeClient } from "@insforge/sdk";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Server-side InsForge client (SSR / Route Handlers / Server Actions).
 * Tokens stay in httpOnly cookies — never use this from Client Components.
 */
export function hasInsForgePublicConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_INSFORGE_URL && process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
  );
}

export function createInsForgeServerClient(accessToken?: string): InsForgeClient {
  return createClient({
    baseUrl: requireEnv("NEXT_PUBLIC_INSFORGE_URL"),
    anonKey: requireEnv("NEXT_PUBLIC_INSFORGE_ANON_KEY"),
    isServerMode: true,
    ...(accessToken ? { edgeFunctionToken: accessToken } : {}),
  });
}

/** Returns null when public InsForge env vars are missing (local UI without backend). */
export function tryCreateInsForgeServerClient(accessToken?: string): InsForgeClient | null {
  if (!hasInsForgePublicConfig()) return null;
  return createInsForgeServerClient(accessToken);
}

/**
 * Privileged server client for admin/service operations only.
 * Never expose INSFORGE_SERVICE_KEY to the browser.
 */
export function createInsForgeServiceClient(): InsForgeClient {
  return createClient({
    baseUrl: requireEnv("NEXT_PUBLIC_INSFORGE_URL"),
    anonKey: requireEnv("INSFORGE_SERVICE_KEY"),
    isServerMode: true,
  });
}

export function tryCreateInsForgeServiceClient(): InsForgeClient | null {
  if (!hasInsForgePublicConfig() || !process.env.INSFORGE_SERVICE_KEY) {
    return null;
  }
  return createInsForgeServiceClient();
}
