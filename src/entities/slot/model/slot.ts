import { ApiError, slotsList } from '../../../shared/api';
import type { Slot, SlotStatus } from '../../../shared/api';

export type { Slot, SlotStatus };

/** How many days ahead the calendar shows bookable slots. */
export const SLOT_HORIZON_DAYS = 14;

export async function listSlots(typeId: string, from: Date, to: Date): Promise<Slot[]> {
  const response = await slotsList({
    typeId,
    from: from.toISOString(),
    to: to.toISOString(),
  });

  if (response.status !== 200) {
    throw new ApiError(response.status, 'Не удалось загрузить слоты');
  }

  return response.data;
}
