import { Stack, Text, Title } from '@mantine/core';
import { ViewEventTypes } from '../../../features/view-event-types';

export function HomePage() {
  return (
    <Stack>
      <Title order={1}>Календарь звонков</Title>
      <Text c="dimmed">Выберите тип события, чтобы записаться на встречу.</Text>
      <ViewEventTypes />
    </Stack>
  );
}
