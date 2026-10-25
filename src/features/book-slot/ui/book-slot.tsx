import { useCallback, useState } from 'react';
import { Alert, Anchor, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import type { Booking } from '../../../entities/booking';
import type { EventType } from '../../../entities/event-type';
import { listSlots, SLOT_HORIZON_DAYS, type Slot } from '../../../entities/slot';
import {
  addDays,
  formatMoscowDate,
  formatMoscowTime,
  formatMoscowWeekday,
  useAsync,
} from '../../../shared';
import { BookingForm } from './booking-form';
import { SlotPicker } from './slot-picker';

function formatSlot(start: string, end: string): string {
  const startDate = new Date(start);
  return `${formatMoscowWeekday(startDate)}, ${formatMoscowDate(startDate)}, ${formatMoscowTime(startDate)}–${formatMoscowTime(new Date(end))}`;
}

interface BookSlotProps {
  eventType: EventType;
  /** Start of the booking horizon; defaults to the moment of the first render. */
  now?: Date;
}

export function BookSlot({ eventType, now }: BookSlotProps) {
  const [from] = useState(() => now ?? new Date());
  const loadSlots = useCallback(
    () => listSlots(eventType.id, from, addDays(from, SLOT_HORIZON_DAYS)),
    [eventType.id, from],
  );
  const slots = useAsync(loadSlots);

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [conflict, setConflict] = useState(false);

  const handleSelect = (slot: Slot) => {
    setConflict(false);
    setSelectedSlot(slot);
  };

  const handleConflict = () => {
    setConflict(true);
    setSelectedSlot(null);
    slots.reload();
  };

  if (booking) {
    return (
      <Stack>
        <Title order={2}>Бронь подтверждена</Title>
        <Text>
          {eventType.name}: {formatSlot(booking.slotStart, booking.slotEnd)}
        </Text>
        <Text>
          {booking.name}, {booking.email}
        </Text>
        <Anchor component={Link} to="/">
          К типам событий
        </Anchor>
      </Stack>
    );
  }

  if (selectedSlot) {
    return (
      <Stack>
        <Title order={2}>{formatSlot(selectedSlot.start, selectedSlot.end)}</Title>
        <BookingForm
          typeId={eventType.id}
          slot={selectedSlot}
          onBooked={setBooking}
          onConflict={handleConflict}
          onBack={() => setSelectedSlot(null)}
        />
      </Stack>
    );
  }

  return (
    <Stack>
      <Title order={2}>Выберите время</Title>
      {conflict && (
        <Alert color="red" title="Слот уже занят">
          Это время только что заняли. Выберите другое.
        </Alert>
      )}
      {slots.status === 'loading' && <Text c="dimmed">Загрузка…</Text>}
      {slots.status === 'error' && <Text c="red">Не удалось загрузить слоты</Text>}
      {slots.status === 'success' && <SlotPicker slots={slots.data} onSelect={handleSelect} />}
    </Stack>
  );
}
