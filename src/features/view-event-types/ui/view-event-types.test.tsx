import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listEventTypes } from '../../../entities/event-type';
import { ApiError } from '../../../shared/api';
import { renderWithProviders } from '../../../shared/lib/testing/render';
import { ViewEventTypes } from './view-event-types';

vi.mock('../../../entities/event-type', () => ({
  listEventTypes: vi.fn(),
}));

describe('ViewEventTypes', () => {
  beforeEach(() => {
    vi.mocked(listEventTypes).mockReset().mockResolvedValue([]);
  });

  it('shows an empty state when there are no event types', async () => {
    renderWithProviders(<ViewEventTypes />);

    expect(await screen.findByText('Пока нет типов событий')).toBeTruthy();
  });

  it('lists event types with name, description, duration and a booking link', async () => {
    vi.mocked(listEventTypes).mockResolvedValue([
      { id: '1', name: 'Консультация', description: 'Разбор вопросов', duration: 30 },
    ]);

    renderWithProviders(<ViewEventTypes />);

    expect(await screen.findByText('Консультация')).toBeTruthy();
    expect(screen.getByText('Разбор вопросов')).toBeTruthy();
    expect(screen.getByText('30 мин')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Записаться' }).getAttribute('href')).toBe(
      '/booking/1',
    );
  });

  it('shows an error when loading fails', async () => {
    vi.mocked(listEventTypes).mockRejectedValue(new ApiError(500, 'Ошибка'));

    renderWithProviders(<ViewEventTypes />);

    expect(await screen.findByText('Не удалось загрузить типы событий')).toBeTruthy();
  });
});
