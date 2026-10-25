import { Stack, Title } from '@mantine/core';
import { CreateEventType } from '../../../features/create-event-type';

export function CreateEventTypePage() {
  return (
    <Stack maw={480}>
      <Title order={1}>Новый тип события</Title>
      <CreateEventType />
    </Stack>
  );
}
