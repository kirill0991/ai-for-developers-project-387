import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { stubFetch } from '../shared/lib/testing/mock-fetch';
import { App } from './app';

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.pushState({}, '', '/');
  });

  it('renders the landing page with event types', async () => {
    stubFetch(200, [{ id: 't1', name: 'Консультация', description: '', duration: 30 }]);

    render(<App />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Календарь звонков' })).toBeTruthy();
    expect(await screen.findByText('Консультация')).toBeTruthy();
  });

  it('shows a not-found message for an unknown event type', async () => {
    stubFetch(200, []);
    window.history.pushState({}, '', '/booking/missing');

    render(<App />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Тип события не найден' }),
    ).toBeTruthy();
  });

  it('renders the new event type form', async () => {
    window.history.pushState({}, '', '/types/new');

    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Новый тип события' })).toBeTruthy();
  });
});
