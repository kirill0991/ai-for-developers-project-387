import { describe, expect, it } from 'vitest';
import {
  formatMoscowDate,
  formatMoscowTime,
  formatMoscowWeekday,
  moscowDayKey,
} from './time';

describe('time', () => {
  it('formats Moscow wall-clock date and time', () => {
    const date = new Date('2026-10-19T06:00:00.000Z');

    expect(formatMoscowDate(date)).toBe('19.10');
    expect(formatMoscowTime(date)).toBe('09:00');
    expect(formatMoscowWeekday(date)).toBe('Пн');
  });

  it('uses the Moscow calendar day near midnight UTC', () => {
    const date = new Date('2026-10-19T22:30:00.000Z'); // 01:30 Moscow, Tuesday

    expect(moscowDayKey(date)).toBe('2026-10-20');
    expect(formatMoscowWeekday(date)).toBe('Вт');
  });
});
