const EMAIL_PATTERN = /[^\s/]+@[^\s/]+\.[^\s/]+/;
const PHONE_PATTERN = /\+?\d[\d\s-]{7,}\d/;

/**
 * invited_guests.contact is free text, normally "08xxxxxxxxxx / email". Pulls
 * the WhatsApp number and email out of it; either may be empty.
 */
export function parseGuestContact(contact: string | null | undefined): { phone: string; email: string } {
  const text = contact ?? "";
  const email = text.match(EMAIL_PATTERN)?.[0].toLowerCase() ?? "";
  const phone = text.replace(email, "").match(PHONE_PATTERN)?.[0].replace(/\s+/g, "") ?? "";
  return { phone, email };
}
