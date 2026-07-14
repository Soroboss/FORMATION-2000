import { randomUUID } from "node:crypto";

export type LogLevel = "debug" | "info" | "warn" | "error";

export function createRequestId(): string {
  return randomUUID();
}

/**
 * Structured JSON logs without secrets.
 * Never pass tokens, passwords, or full payment payloads.
 */
export function logEvent(input: {
  level?: LogLevel;
  msg: string;
  requestId?: string;
  route?: string;
  ms?: number;
  [key: string]: unknown;
}) {
  const { level = "info", ...rest } = input;
  const line = JSON.stringify({
    level,
    ts: new Date().toISOString(),
    ...rest,
  });
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export function redactSecrets(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === "string") {
    if (/^(ik_|anon_|Bearer\s)/i.test(value) || value.length > 80) {
      return "[redacted]";
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (/(secret|password|token|authorization|api[_-]?key|cookie)/i.test(k)) {
        out[k] = "[redacted]";
      } else {
        out[k] = redactSecrets(v);
      }
    }
    return out;
  }
  return value;
}
