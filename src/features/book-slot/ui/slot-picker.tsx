import { useState } from 'react';
import { Button, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import type { Slot } from '../../../entities/slot';
import {
  formatMoscowDate,
  formatMoscowTime,
  formatMoscowWeekday,
  moscowDayKey,
} from '../../../shared';

interface Day {
  key: string;
  date: Date;
  slots: Slot[];
}

function groupByDay(slots: Slot[]): Day[] {
  const days = new Map<string, Day>();

  for (const slot of slots) {
    const date = new Date(slot.start);
    const key = moscowDayKey(date);
    const day = days.get(key) ?? { key, date, slots: [] };
    day.slots.push(slot);
    days.set(key, day);
  }

  return [...days.values()];
}

function hasFreeSlots(day: Day): boolean {
  return day.slots.some((slot) => slot.status === 'free');
}

interface SlotPickerProps {
  slots: Slot[];
  onSelect: (slot: Slot) => void;
}

export function SlotPicker({ slots, onSelect }: SlotPickerProps) {
  const days = groupByDay(slots);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  if (days.length === 0) {
    return <Text c="dimmed">Нет доступного времени в ближайшие дни</Text>;
  }

  const selectedDay =
    days.find((day) => day.key === selectedKey) ?? days.find(hasFreeSlots) ?? days[0];

  return (
    <Stack>
      <Group gap="xs">
        {days.map((day) => (
          <Button
            key={day.key}
            size="compact-md"
            variant={day.key === selectedDay.key ? 'filled' : 'default'}
            disabled={!hasFreeSlots(day)}
            aria-pressed={day.key === selectedDay.key}
            onClick={() => setSelectedKey(day.key)}
          >
            {formatMoscowWeekday(day.date)}, {formatMoscowDate(day.date)}
          </Button>
        ))}
      </Group>
      <SimpleGrid cols={{ base: 3, sm: 4 }} spacing="xs">
        {selectedDay.slots.map((slot) => {
          const time = formatMoscowTime(new Date(slot.start));

          return slot.status === 'free' ? (
            <Button key={slot.start} variant="outline" onClick={() => onSelect(slot)}>
              {time}
            </Button>
          ) : (
            <Button key={slot.start} variant="default" disabled>
              {time} · Занято
            </Button>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
