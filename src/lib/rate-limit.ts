import { headers } from "next/headers";

// Shared by castVote and safeTokenLookup. Per-process in-memory sliding
// window keyed by IP — no new table/infra.
// ponytail: resets on redeploy and isn't shared across instances; fine for a
// single-instance internal event tool, upgrade to a DB/Redis counter first if
// this ever runs horizontally scaled.
const attemptsByKey = new Map<string, { count: number; resetAt: number }>();

export async function clientIp(): Promise<string> {
  const headerList = await headers();
  return headerList.get("x-forwarded-for")?.split(",")[0].trim() || headerList.get("x-real-ip") || "unknown";
}

/** Returns true if `key` has exceeded `maxAttempts` within `windowMs`. */
export function isRateLimited(key: string, windowMs: number, maxAttempts: number): boolean {
  const now = Date.now();
  const entry = attemptsByKey.get(key);

  if (!entry || now > entry.resetAt) {
    attemptsByKey.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > maxAttempts;
}
