import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEventType } from '../../../entities/event-type';
import { ApiError } from '../../../shared/api';
import { renderWithProviders } from '../../../shared/lib/testing/render';
import { CreateEventType } from './create-event-type';

vi.mock('../../../entities/event-type', () => ({
  createEventType: vi.fn(),
}));

function renderForm() {
  return renderWithProviders(
    <Routes>
      <Route path="/types/new" element={<CreateEventType />} />
      <Route path="/" element={<p>Список типов</p>} />
    </Routes>,
    { route: '/types/new' },
  );
}

describe('CreateEventType', () => {
  beforeEach(() => {
    vi.mocked(createEventType).mockReset().mockResolvedValue({
      id: '1',
      name: 'Консультация',
      description: 'Разбор вопросов',
      duration: 45,
    });
  });

  it('creates an event type and returns to the list', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Название'), 'Консультация');
    await user.type(screen.getByLabelText('Описание'), 'Разбор вопросов');
    await user.clear(screen.getByLabelText('Длительность (минуты)'));
    await user.type(screen.getByLabelText('Длительность (минуты)'), '45');
    await user.click(screen.getByRole('button', { name: 'Создать' }));

    expect(createEventType).toHaveBeenCalledWith({
      name: 'Консультация',
      description: 'Разбор вопросов',
      duration: 45,
    });
    expect(await screen.findByText('Список типов')).toBeTruthy();
  });

  it('allows an empty description', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Название'), 'Консультация');
    await user.click(screen.getByRole('button', { name: 'Создать' }));

    expect(createEventType).toHaveBeenCalledWith({
      name: 'Консультация',
      description: '',
      duration: 30,
    });
  });

  it('shows an error when the name is empty', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Создать' }));

    expect(await screen.findByText('Укажите название')).toBeTruthy();
    expect(createEventType).not.toHaveBeenCalled();
  });

  it('shows an error when the duration is empty', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Название'), 'Консультация');
    await user.clear(screen.getByLabelText('Длительность (минуты)'));
    await user.click(screen.getByRole('button', { name: 'Создать' }));

    expect(
      await screen.findByText('Укажите длительность — целое число минут больше нуля'),
    ).toBeTruthy();
    expect(createEventType).not.toHaveBeenCalled();
  });

  it('shows an error when the API rejects the request', async () => {
    vi.mocked(createEventType).mockRejectedValue(new ApiError(400, 'Bad Request'));
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Название'), 'Консультация');
    await user.click(screen.getByRole('button', { name: 'Создать' }));

    expect(await screen.findByText('Не удалось создать тип события')).toBeTruthy();
  });
});
