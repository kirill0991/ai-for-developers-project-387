import { Stack, Title } from '@mantine/core';
import { ViewBookings } from '../../../features/view-bookings';

export function BookingsPage() {
  return (
    <Stack>
      <Title order={1}>Брони</Title>
      <ViewBookings />
    </Stack>
  );
}
