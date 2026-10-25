import { randomUUID } from 'node:crypto';
import type { Db } from '../db';
import type { EventType, EventTypeCreate } from '../domain/types';

interface EventTypeRow {
  id: string;
  name: string;
  description: string;
  duration: number;
}

export function listEventTypes(db: Db): EventType[] {
  return db
    .prepare('SELECT id, name, description, duration FROM event_types ORDER BY name')
    .all() as EventTypeRow[];
}

export function getEventType(db: Db, id: string): EventType | undefined {
  return db
    .prepare('SELECT id, name, description, duration FROM event_types WHERE id = ?')
    .get(id) as EventTypeRow | undefined;
}

export function createEventType(db: Db, input: EventTypeCreate): EventType {
  const eventType: EventType = { id: randomUUID(), ...input };

  db.prepare('INSERT INTO event_types (id, name, description, duration) VALUES (?, ?, ?, ?)').run(
    eventType.id,
    eventType.name,
    eventType.description,
    eventType.duration,
  );

  return eventType;
}
