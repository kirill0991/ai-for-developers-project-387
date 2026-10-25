import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createBooking } from '../../../entities/booking';
import { listSlots, type Slot } from '../../../entities/slot';
import { ApiError } from '../../../shared/api';
import { renderWithProviders } from '../../../shared/lib/testing/render';
import { BookSlot } from './book-slot';

vi.mock('../../../entities/slot', () => ({
  listSlots: vi.fn(),
  SLOT_HORIZON_DAYS: 14,
}));

vi.mock('../../../entities/booking', () => ({
  createBooking: vi.fn(),
}));

const eventType = { id: 't1', name: 'Консультация', description: '', duration: 30 };
const now = new Date('2026-10-19T00:00:00Z'); // Monday 03:00 Moscow

const slots: Slot[] = [
  { start: '2026-10-19T06:00:00.000Z', end: '2026-10-19T06:30:00.000Z', status: 'free' },
  { start: '2026-10-19T06:30:00.000Z', end: '2026-10-19T07:00:00.000Z', status: 'occupied' },
  { start: '2026-10-20T06:00:00.000Z', end: '2026-10-20T06:30:00.000Z', status: 'free' },
];

const booking = {
  id: '1',
  name: 'Иван',
  email: 'ivan@example.com',
  typeId: 't1',
  slotStart: '2026-10-19T06:00:00.000Z',
  slotEnd: '2026-10-19T06:30:00.000Z',
  createdAt: '2026-10-19T00:00:00.000Z',
};

async function fillForm(user: ReturnType<typeof userEvent.setup>, name: string, email: string) {
  await user.type(screen.getByLabelText('Имя'), name);
  await user.type(screen.getByLabelText('Email'), email);
  await user.click(screen.getByRole('button', { name: 'Записаться' }));
}

describe('BookSlot', () => {
  beforeEach(() => {
    vi.mocked(listSlots).mockReset().mockResolvedValue(slots);
    vi.mocked(createBooking).mockReset().mockResolvedValue(booking);
  });

  it('requests slots for the 14-day horizon', async () => {
    renderWithProviders(<BookSlot eventType={eventType} now={now} />);

    await screen.findByRole('button', { name: '09:00' });
    expect(listSlots).toHaveBeenCalledTimes(1);
    expect(listSlots).toHaveBeenCalledWith('t1', now, new Date('2026-11-02T00:00:00Z'));
  });

  it('shows occupied slots as disabled', async () => {
    renderWithProviders(<BookSlot eventType={eventType} now={now} />);

    const occupied = await screen.findByRole('button', { name: '09:30 · Занято' });
    expect(occupied).toHaveProperty('disabled', true);
  });

  it('switches between days', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookSlot eventType={eventType} now={now} />);

    await user.click(await screen.findByRole('button', { name: 'Вт, 20.10' }));

    expect(screen.getByRole('button', { name: '09:00' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '09:30 · Занято' })).toBeNull();
  });

  it('lets a guest book a free slot and shows a confirmation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookSlot eventType={eventType} now={now} />);

    await user.click(await screen.findByRole('button', { name: '09:00' }));
    await fillForm(user, 'Иван', 'ivan@example.com');

    expect(await screen.findByText('Бронь подтверждена')).toBeTruthy();
    expect(screen.getByText('Консультация: Пн, 19.10, 09:00–09:30')).toBeTruthy();
    expect(createBooking).toHaveBeenCalledWith({
      name: 'Иван',
      email: 'ivan@example.com',
      typeId: 't1',
      slotStart: '2026-10-19T06:00:00.000Z',
    });
  });

  it('shows validation errors for an empty form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookSlot eventType={eventType} now={now} />);

    await user.click(await screen.findByRole('button', { name: '09:00' }));
    await user.click(screen.getByRole('button', { name: 'Записаться' }));

    expect(screen.getByText('Укажите имя')).toBeTruthy();
    expect(screen.getByText('Укажите email')).toBeTruthy();
    expect(createBooking).not.toHaveBeenCalled();
  });

  it('rejects an invalid email', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookSlot eventType={eventType} now={now} />);

    await user.click(await screen.findByRole('button', { name: '09:00' }));
    await fillForm(user, 'Иван', 'not-an-email');

    expect(screen.getByText('Некорректный email')).toBeTruthy();
    expect(createBooking).not.toHaveBeenCalled();
  });

  it('returns to the calendar and reloads slots when the slot is already taken', async () => {
    vi.mocked(createBooking).mockRejectedValue(new ApiError(409, 'Слот уже занят'));
    const user = userEvent.setup();
    renderWithProviders(<BookSlot eventType={eventType} now={now} />);

    await user.click(await screen.findByRole('button', { name: '09:00' }));
    await fillForm(user, 'Иван', 'ivan@example.com');

    expect(await screen.findByText('Слот уже занят')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Выберите время' })).toBeTruthy();
    expect(listSlots).toHaveBeenCalledTimes(2);
  });

  it('shows an error when booking fails for another reason', async () => {
    vi.mocked(createBooking).mockRejectedValue(new ApiError(500, 'Ошибка'));
    const user = userEvent.setup();
    renderWithProviders(<BookSlot eventType={eventType} now={now} />);

    await user.click(await screen.findByRole('button', { name: '09:00' }));
    await fillForm(user, 'Иван', 'ivan@example.com');

    expect(await screen.findByText('Не удалось создать бронь, попробуйте ещё раз')).toBeTruthy();
  });

  it('shows an error when slots fail to load', async () => {
    vi.mocked(listSlots).mockRejectedValue(new ApiError(500, 'Ошибка'));
    renderWithProviders(<BookSlot eventType={eventType} now={now} />);

    expect(await screen.findByText('Не удалось загрузить слоты')).toBeTruthy();
  });
});
