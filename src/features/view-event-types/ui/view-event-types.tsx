import { Badge, Button, Card, Group, Stack, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { listEventTypes } from '../../../entities/event-type';
import { useAsync } from '../../../shared';

export function ViewEventTypes() {
  const eventTypes = useAsync(listEventTypes);

  if (eventTypes.status === 'loading') {
    return <Text c="dimmed">Загрузка…</Text>;
  }

  if (eventTypes.status === 'error') {
    return <Text c="red">Не удалось загрузить типы событий</Text>;
  }

  if (eventTypes.data.length === 0) {
    return (
      <Stack align="flex-start">
        <Text c="dimmed">Пока нет типов событий</Text>
        <Button component={Link} to="/types/new" variant="light">
          Создать тип события
        </Button>
      </Stack>
    );
  }

  return (
    <Stack>
      {eventTypes.data.map((eventType) => (
        <Card key={eventType.id} withBorder>
          <Group justify="space-between" wrap="nowrap" align="flex-start">
            <Stack gap={4}>
              <Group gap="xs">
                <Text fw={500}>{eventType.name}</Text>
                <Badge variant="light">{eventType.duration} мин</Badge>
              </Group>
              {eventType.description && (
                <Text c="dimmed" size="sm">
                  {eventType.description}
                </Text>
              )}
            </Stack>
            <Button component={Link} to={`/booking/${eventType.id}`} variant="light">
              Записаться
            </Button>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}
