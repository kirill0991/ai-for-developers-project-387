import { useCallback } from 'react';
import { Anchor, Badge, Group, Stack, Text, Title } from '@mantine/core';
import { Link, useParams } from 'react-router-dom';
import { getEventType } from '../../../entities/event-type';
import { BookSlot } from '../../../features/book-slot';
import { useAsync } from '../../../shared';

export function BookingPage() {
  const { typeId = '' } = useParams<{ typeId: string }>();
  const loadEventType = useCallback(() => getEventType(typeId), [typeId]);
  const eventType = useAsync(loadEventType);

  if (eventType.status === 'loading') {
    return <Text c="dimmed">Загрузка…</Text>;
  }

  if (eventType.status === 'error') {
    return <Text c="red">Не удалось загрузить тип события</Text>;
  }

  if (!eventType.data) {
    return (
      <Stack align="flex-start">
        <Title order={1}>Тип события не найден</Title>
        <Anchor component={Link} to="/">
          К типам событий
        </Anchor>
      </Stack>
    );
  }

  return (
    <Stack>
      <Stack gap={4}>
        <Group gap="xs">
          <Title order={1}>{eventType.data.name}</Title>
          <Badge variant="light">{eventType.data.duration} мин</Badge>
        </Group>
        {eventType.data.description && <Text c="dimmed">{eventType.data.description}</Text>}
      </Stack>
      <BookSlot key={eventType.data.id} eventType={eventType.data} />
    </Stack>
  );
}
