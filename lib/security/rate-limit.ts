/**
 * Best-effort in-memory rate limiter (per Edge/server isolate).
 * Suitable for MVP abuse slowing — not a distributed hard limit.
 */

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function checkRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): RateLimitResult {
  const now = input.now ?? Date.now();
  const existing = store.get(input.key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + input.windowMs;
    store.set(input.key, { count: 1, resetAt });
    return { allowed: true, remaining: input.limit - 1, resetAt };
  }

  if (existing.count >= input.limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  store.set(input.key, existing);
  return {
    allowed: true,
    remaining: Math.max(0, input.limit - existing.count),
    resetAt: existing.resetAt,
  };
}

/** Test helper — clears buckets between unit tests. */
export function __resetRateLimitStoreForTests() {
  store.clear();
}
