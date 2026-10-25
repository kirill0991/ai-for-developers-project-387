/**
 * Europe/Moscow is UTC+3 year-round (no daylight saving time since 2014).
 * We use this fixed offset to convert between Moscow wall-clock and UTC.
 */
export const MOSCOW_OFFSET_HOURS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

/**
 * Returns a Date whose UTC fields represent the Moscow wall-clock time of
 * `date`. Useful for reading Moscow hours/minutes via the `getUTC*` methods.
 */
export function toMoscow(date: Date): Date {
  return new Date(date.getTime() + MOSCOW_OFFSET_HOURS * 60 * 60 * 1000);
}

/** Returns a new Date `days` days after `date`. */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Formats a Date as Moscow wall-clock time, e.g. "09:30". */
export function formatMoscowTime(date: Date): string {
  const moscow = toMoscow(date);
  const hh = String(moscow.getUTCHours()).padStart(2, '0');
  const mm = String(moscow.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Formats a Date as a Moscow wall-clock date, e.g. "19.10". */
export function formatMoscowDate(date: Date): string {
  const moscow = toMoscow(date);
  const dd = String(moscow.getUTCDate()).padStart(2, '0');
  const mm = String(moscow.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}`;
}

/** Formats a Date as a short Moscow weekday name, e.g. "Пн". */
export function formatMoscowWeekday(date: Date): string {
  return WEEKDAYS[toMoscow(date).getUTCDay()];
}

/** Returns the Moscow wall-clock calendar day of a Date, e.g. "2026-10-19". */
export function moscowDayKey(date: Date): string {
  return toMoscow(date).toISOString().slice(0, 10);
}
