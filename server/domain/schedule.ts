/**
 * Europe/Moscow is UTC+3 year-round (no daylight saving time since 2014).
 * We use this fixed offset to convert between Moscow wall-clock and UTC.
 */
export const MOSCOW_OFFSET_HOURS = 3;

/**
 * The owner's working schedule: every day 09:00–18:00, slots start on a
 * 30-minute grid. The slot length itself is the event type's duration.
 */
export const SCHEDULE = {
  startHour: 9,
  endHour: 18,
  gridMinutes: 30,
} as const;

/** How many days ahead guests can book, counted from the current moment. */
export const BOOKING_HORIZON_DAYS = 14;
