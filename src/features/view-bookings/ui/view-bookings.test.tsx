import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listBookings } from '../../../entities/booking';
import { listEventTypes } from '../../../entities/event-type';
import { ApiError } from '../../../shared/api';
import { renderWithProviders } from '../../../shared/lib/testing/render';
import { ViewBookings } from './view-bookings';

vi.mock('../../../entities/booking', () => ({
  listBookings: vi.fn(),
}));

vi.mock('../../../entities/event-type', () => ({
  listEventTypes: vi.fn(),
}));

describe('ViewBookings', () => {
  beforeEach(() => {
    vi.mocked(listBookings).mockReset().mockResolvedValue([]);
    vi.mocked(listEventTypes)
      .mockReset()
      .mockResolvedValue([{ id: 't1', name: 'Консультация', description: '', duration: 30 }]);
  });

  it('shows an empty state when there are no bookings', async () => {
    renderWithProviders(<ViewBookings />);

    expect(await screen.findByText('Пока нет броней')).toBeTruthy();
  });

  it('lists bookings with slot, event type, guest and creation time', async () => {
    vi.mocked(listBookings).mockResolvedValue([
      {
        id: '1',
        name: 'Иван',
        email: 'ivan@example.com',
        typeId: 't1',
        slotStart: '2026-10-19T06:00:00.000Z',
        slotEnd: '2026-10-19T06:30:00.000Z',
        createdAt: '2026-10-18T12:15:00.000Z',
      },
    ]);

    renderWithProviders(<ViewBookings />);

    expect(await screen.findByText('19.10')).toBeTruthy();
    expect(screen.getByText('09:00–09:30')).toBeTruthy();
    expect(screen.getByText('Консультация')).toBeTruthy();
    expect(screen.getByText('Иван')).toBeTruthy();
    expect(screen.getByText('ivan@example.com')).toBeTruthy();
    expect(screen.getByText('18.10 15:15')).toBeTruthy();
  });

  it('shows an error when loading fails', async () => {
    vi.mocked(listBookings).mockRejectedValue(new ApiError(500, 'Ошибка'));

    renderWithProviders(<ViewBookings />);

    expect(await screen.findByText('Не удалось загрузить брони')).toBeTruthy();
  });
});
