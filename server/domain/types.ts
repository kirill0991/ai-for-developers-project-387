export interface EventType {
  id: string;
  name: string;
  description: string;
  duration: number;
}

export interface EventTypeCreate {
  name: string;
  description: string;
  duration: number;
}

export type SlotStatus = 'free' | 'occupied';

export interface Slot {
  start: string;
  end: string;
  status: SlotStatus;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  typeId: string;
  slotStart: string;
  slotEnd: string;
  createdAt: string;
}

export interface BookingCreate {
  name: string;
  email: string;
  typeId: string;
  slotStart: string;
}
