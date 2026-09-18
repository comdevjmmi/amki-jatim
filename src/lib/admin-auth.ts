// Minimal internal gate for /admin: one shared committee password (ADMIN_PASSWORD),
// signed into a cookie with Web Crypto (works in both Node and Edge runtimes).
// ponytail: no per-admin accounts, no expiry/revocation beyond cookie maxAge — upgrade
// to Supabase Auth + roles if multiple admins/audit trail are ever needed.
export const ADMIN_SESSION_COOKIE = "admin_session";

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createAdminSessionToken(): Promise<string> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ADMIN_SESSION_COOKIE));
  return toHex(signature);
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    return token === (await createAdminSessionToken());
  } catch {
    return false;
  }
}
