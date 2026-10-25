import { Stack, Table, Text } from '@mantine/core';
import { listBookings } from '../../../entities/booking';
import { listEventTypes } from '../../../entities/event-type';
import { formatMoscowDate, formatMoscowTime, useAsync } from '../../../shared';

async function loadBookings() {
  const [bookings, eventTypes] = await Promise.all([listBookings(), listEventTypes()]);
  const typeNames = new Map(eventTypes.map((eventType) => [eventType.id, eventType.name]));

  return bookings.map((booking) => ({
    ...booking,
    typeName: typeNames.get(booking.typeId) ?? '—',
  }));
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return `${formatMoscowDate(date)} ${formatMoscowTime(date)}`;
}

export function ViewBookings() {
  const bookings = useAsync(loadBookings);

  if (bookings.status === 'loading') {
    return <Text c="dimmed">Загрузка…</Text>;
  }

  if (bookings.status === 'error') {
    return <Text c="red">Не удалось загрузить брони</Text>;
  }

  if (bookings.data.length === 0) {
    return <Text c="dimmed">Пока нет броней</Text>;
  }

  return (
    <Stack>
      <Table.ScrollContainer minWidth={640}>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Дата</Table.Th>
              <Table.Th>Время</Table.Th>
              <Table.Th>Тип события</Table.Th>
              <Table.Th>Имя</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Создана</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {bookings.data.map((booking) => (
              <Table.Tr key={booking.id}>
                <Table.Td>{formatMoscowDate(new Date(booking.slotStart))}</Table.Td>
                <Table.Td>
                  {formatMoscowTime(new Date(booking.slotStart))}–
                  {formatMoscowTime(new Date(booking.slotEnd))}
                </Table.Td>
                <Table.Td>{booking.typeName}</Table.Td>
                <Table.Td>{booking.name}</Table.Td>
                <Table.Td>{booking.email}</Table.Td>
                <Table.Td>{formatDateTime(booking.createdAt)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}
