import { ApiError, bookingsCreate, bookingsList } from '../../../shared/api';
import type { Booking, BookingCreate } from '../../../shared/api';

export type { Booking, BookingCreate };

export async function listBookings(): Promise<Booking[]> {
  const response = await bookingsList();
  if (response.status !== 200) {
    throw new ApiError(response.status, 'Не удалось загрузить брони');
  }
  return response.data;
}

/** Creates a booking; throws an `ApiError` with status 409 if the time is taken. */
export async function createBooking(input: BookingCreate): Promise<Booking> {
  const response = await bookingsCreate(input);
  if (response.status === 201) {
    return response.data;
  }
  // The SDK types only list documented statuses, so compare against a plain number.
  const status: number = response.status;
  throw new ApiError(status, status === 409 ? 'Слот уже занят' : 'Не удалось создать бронь');
}
