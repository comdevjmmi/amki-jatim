import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Minimal internal gate for /admin: one shared committee password (ADMIN_PASSWORD).
// No per-admin accounts, no revocation list beyond changing the password itself —
// upgrade to Supabase Auth + roles if multiple admins/audit trail are ever needed.
export const ADMIN_SESSION_COOKIE = "admin_session";

const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8h, matches the cookie's own maxAge

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toHex(signature);
}

/** Constant-time string compare — avoids leaking match length via early-exit timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Session token = `${expiresAt}.${signature}`, where signature is an HMAC over
 * "admin_session.<expiresAt>". Unlike signing a constant string, this makes the
 * token expire server-side (not just via the cookie's own maxAge, which a
 * replayed/manually-set cookie can ignore) without needing any server-side
 * session store.
 */
export async function createAdminSessionToken(): Promise<string> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured");

  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const signature = await hmac(secret, `${ADMIN_SESSION_COOKIE}.${expiresAt}`);
  return `${expiresAt}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;

  const separatorIndex = token.indexOf(".");
  if (separatorIndex === -1) return false;

  const expiresAtRaw = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  try {
    const expected = await hmac(secret, `${ADMIN_SESSION_COOKIE}.${expiresAtRaw}`);
    return timingSafeEqual(signature, expected);
  } catch {
    return false;
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  // Compare HMACs of both sides (rather than the raw strings) so the
  // comparison is always constant-time regardless of length differences.
  const [a, b] = await Promise.all([hmac(secret, password), hmac(secret, secret)]);
  return timingSafeEqual(a, b);
}

/**
 * Defense-in-depth check for Server Actions under /admin. Next.js Server
 * Actions dispatch on a global action id, not strictly on the URL that
 * rendered the form — per Next's own proxy.js docs: "Always verify
 * authentication and authorization inside each Server Function rather than
 * relying on Proxy alone." Call this first in every admin mutation.
 */
export async function requireAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) {
    redirect("/admin/login");
  }
}
