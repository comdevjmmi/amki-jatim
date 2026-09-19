// Shared by the admin token generator and the public /vote submission so
// both sides hash a raw voting token identically before it ever touches the
// database — only the hash is stored (see voting_tokens.token_hash).
const TOKEN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L — typable by hand
// 8 chars over a 32-symbol alphabet = 40 bits (~1.1 trillion combinations).
// Audit finding: 6 chars (30 bits, ~1.07B) was guessable by a sustained
// unrate-limited attacker against castVote — see rate limiting there too.
const TOKEN_RANDOM_LENGTH = 8;

export function generateVoteToken(): string {
  const bytes = new Uint8Array(TOKEN_RANDOM_LENGTH);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (b) => TOKEN_CHARS[b % TOKEN_CHARS.length]).join("");
  return `AMKI-${suffix}`;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Normalizes (trim + uppercase) so voters can type the token in lowercase. */
export async function hashVoteToken(token: string): Promise<string> {
  const secret = process.env.VOTE_TOKEN_SECRET;
  if (!secret) throw new Error("VOTE_TOKEN_SECRET is not configured");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(token.trim().toUpperCase()),
  );
  return toHex(signature);
}
