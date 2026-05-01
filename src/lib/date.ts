/**
 * Surgery date is stored as an ISO `YYYY-MM-DD` string so the date picker
 * can round-trip the value. Older profiles may still hold a human-readable
 * string like "June 24, 2026" — we coerce those at hydration time.
 */

const HUMAN_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function isISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function toISODate(value: string): string {
  if (!value) return "";
  if (isISODate(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatSurgeryDate(value: string): string {
  if (!value) return "";
  const iso = isISODate(value) ? value : toISODate(value);
  if (!iso) return value;
  // Parse as local date to avoid timezone shifting "2026-06-24" to the prior day.
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return HUMAN_FORMAT.format(dt);
}

export function daysUntilSurgery(value: string): number {
  const iso = isISODate(value) ? value : toISODate(value);
  if (!iso) return 0;
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}
