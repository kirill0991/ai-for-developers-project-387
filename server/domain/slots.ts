import { MOSCOW_OFFSET_HOURS, SCHEDULE } from './schedule';

export interface SlotInterval {
  start: Date;
  end: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/**
 * Returns the Moscow wall-clock day number (days since the Unix epoch) of a
 * UTC instant. Used to iterate over calendar days in the owner's timezone.
 */
function moscowDayNumber(date: Date): number {
  return Math.floor((date.getTime() + MOSCOW_OFFSET_HOURS * HOUR_MS) / DAY_MS);
}

/**
 * Generates the bookable slots for an event type between `from` and `to`
 * (inclusive of `from`, exclusive of `to`). Slots start on a 30-minute grid
 * within the daily 09:00–18:00 schedule and last `durationMinutes` minutes.
 */
export function generateSlots(from: Date, to: Date, durationMinutes: number): SlotInterval[] {
  const slots: SlotInterval[] = [];
  const durationMs = durationMinutes * MINUTE_MS;

  const fromDay = moscowDayNumber(from);
  const toDay = moscowDayNumber(to);

  // For long-duration events (longer than the working day), we start from the earliest possible time (09:00)
  // and extend for the full duration. This allows events like "Workshop" (10 hours) to be bookable.
  const startOfDayMinutes = SCHEDULE.startHour * 60; // 09:00 in minutes
  const endOfDayMinutes = SCHEDULE.endHour * 60; // 18:00 in minutes
  const workingDayMinutes = endOfDayMinutes - startOfDayMinutes; // 540 minutes = 9 hours

  // If duration is longer than the working day, we start from 09:00 and extend for the full duration
  // This allows long events to be booked starting at 09:00 and ending at 18:00 + (duration - 9 hours)
  const effectiveStartMinutes = durationMinutes > workingDayMinutes
    ? startOfDayMinutes
    : SCHEDULE.endHour * 60 - durationMinutes;

  for (let day = fromDay; day <= toDay; day += 1) {
    const dayBase = day * DAY_MS; // UTC midnight of the Moscow wall-clock date
    const lastStartMinutes = effectiveStartMinutes;

    for (
      let minutes = SCHEDULE.startHour * 60;
      minutes <= lastStartMinutes;
      minutes += SCHEDULE.gridMinutes
    ) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;

      const start = new Date(dayBase + (hour - MOSCOW_OFFSET_HOURS) * HOUR_MS + minute * MINUTE_MS);
      const end = new Date(start.getTime() + durationMs);

      if (start.getTime() >= from.getTime() && end.getTime() <= to.getTime()) {
        slots.push({ start, end });
      }
    }
  }

  return slots;
}

/**
 * Checks that a booking may start at `start`: it must be one of the slots
 * offered within the booking horizon from `now`, i.e. in the future, on the
 * 30-minute grid and fully inside the working hours.
 */
export function isBookableSlot(
  start: Date,
  durationMinutes: number,
  now: Date,
  horizonDays: number,
): boolean {
  const horizonEnd = new Date(now.getTime() + horizonDays * DAY_MS);
  return generateSlots(now, horizonEnd, durationMinutes).some(
    (slot) => slot.start.getTime() === start.getTime(),
  );
}
