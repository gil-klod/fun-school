/** Israel timezone — matches the app's primary audience. */
export const APP_TIMEZONE = "Asia/Jerusalem";

const MS_DAY = 86_400_000;

export function dateKeyInTimeZone(date: Date, timeZone = APP_TIMEZONE): string {
  return date.toLocaleDateString("en-CA", { timeZone });
}

/** Calendar days between two instants in the given timezone (0 = same local day). */
export function calendarDaysAgo(from: Date, to = new Date(), timeZone = APP_TIMEZONE): number {
  const fromKey = dateKeyInTimeZone(from, timeZone);
  const toKey = dateKeyInTimeZone(to, timeZone);
  if (fromKey === toKey) return 0;
  const fromNoon = new Date(`${fromKey}T12:00:00`);
  const toNoon = new Date(`${toKey}T12:00:00`);
  return Math.round((toNoon.getTime() - fromNoon.getTime()) / MS_DAY);
}

export function formatActivityTimestamp(iso: string, timeZone = APP_TIMEZONE) {
  const date = new Date(iso);
  const days = calendarDaysAgo(date, new Date(), timeZone);
  const detail = date.toLocaleString("he-IL", {
    timeZone,
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let label: string;
  if (days === 0) label = "Today";
  else if (days === 1) label = "Yesterday";
  else if (days < 7) label = `${days} days ago`;
  else label = date.toLocaleDateString("he-IL", { timeZone });

  return { label, detail, days };
}

export function isWithinRollingDays(iso: string, days: number, now = Date.now()) {
  return new Date(iso).getTime() >= now - days * MS_DAY;
}
