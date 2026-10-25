import { randomUUID } from 'node:crypto';
import type { Db } from '../db';
import type { Booking } from '../domain/types';

interface BookingRow {
  id: string;
  name: string;
  email: string;
  type_id: string;
  slot_start: string;
  slot_end: string;
  created_at: string;
}

export interface NewBooking {
  name: string;
  email: string;
  typeId: string;
  slotStart: string;
  slotEnd: string;
}

function toBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    typeId: row.type_id,
    slotStart: row.slot_start,
    slotEnd: row.slot_end,
    createdAt: row.created_at,
  };
}

export function listBookings(db: Db): Booking[] {
  const rows = db.prepare('SELECT * FROM bookings ORDER BY slot_start').all() as BookingRow[];
  return rows.map(toBooking);
}

export function createBooking(db: Db, input: NewBooking): Booking {
  const booking: Booking = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    typeId: input.typeId,
    slotStart: input.slotStart,
    slotEnd: input.slotEnd,
    createdAt: new Date().toISOString(),
  };

  db.prepare(
    'INSERT INTO bookings (id, name, email, type_id, slot_start, slot_end, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run(
    booking.id,
    booking.name,
    booking.email,
    booking.typeId,
    booking.slotStart,
    booking.slotEnd,
    booking.createdAt,
  );

  return booking;
}

/**
 * Returns a booking whose `[slot_start, slot_end)` interval overlaps the
 * given `[slotStart, slotEnd)` interval, or `undefined` if there is none.
 */
export function findConflictingBooking(
  db: Db,
  slotStart: string,
  slotEnd: string,
): Booking | undefined {
  const row = db
    .prepare('SELECT * FROM bookings WHERE slot_start < ? AND slot_end > ? LIMIT 1')
    .get(slotEnd, slotStart) as BookingRow | undefined;

  return row ? toBooking(row) : undefined;
}
