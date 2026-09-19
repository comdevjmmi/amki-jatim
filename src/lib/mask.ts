/** "Bara Ardiwinata" -> "B*** A*********" (first letter of each word kept). */
export function maskName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => (word.length <= 1 ? word : word[0] + "*".repeat(word.length - 1)))
    .join(" ");
}

/** "bara@student.its.ac.id" -> "b***@student.its.ac.id" (domain kept, local part masked). */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const maskedLocal = local.length <= 1 ? local : local[0] + "*".repeat(local.length - 1);
  return `${maskedLocal}@${domain}`;
}

/** "081234567890" -> "0812****7890" (first 4 + last 4 digits kept). */
export function maskPhone(phone: string): string {
  if (phone.length <= 8) return "*".repeat(phone.length);
  return `${phone.slice(0, 4)}****${phone.slice(-4)}`;
}

/**
 * Normalizes an Indonesian phone number to digits-only, 62-prefixed form so
 * "0812...", "62812...", and "+62812..." all compare equal regardless of how
 * the participant originally typed it at registration.
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return digits;
}
