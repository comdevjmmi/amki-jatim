/** ISO timestamp -> "07.42" in Jakarta time (the venue's clock). */
export function formatJam(iso: string): string {
  return new Date(iso)
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })
    .replace(":", ".");
}
