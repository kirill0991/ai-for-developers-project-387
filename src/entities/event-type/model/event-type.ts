import { ApiError, eventTypesCreate, eventTypesList } from '../../../shared/api';
import type { EventType, EventTypeCreate } from '../../../shared/api';

export type { EventType, EventTypeCreate };

export async function listEventTypes(): Promise<EventType[]> {
  const response = await eventTypesList();
  if (response.status !== 200) {
    throw new ApiError(response.status, 'Не удалось загрузить типы событий');
  }
  return response.data;
}

/** Finds an event type by id; the API has no single-item endpoint, so it filters the list. */
export async function getEventType(id: string): Promise<EventType | undefined> {
  const eventTypes = await listEventTypes();
  return eventTypes.find((eventType) => eventType.id === id);
}

export async function createEventType(input: EventTypeCreate): Promise<EventType> {
  const response = await eventTypesCreate(input);
  if (response.status !== 201) {
    throw new ApiError(response.status, 'Не удалось создать тип события');
  }
  return response.data;
}
