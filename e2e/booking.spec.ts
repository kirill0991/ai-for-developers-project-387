import { expect, test, type APIRequestContext } from '@playwright/test';
import {
  addDays,
  formatMoscowDate,
  formatMoscowTime,
  formatMoscowWeekday,
  moscowDayKey,
} from '../src/shared/lib/time';

interface Slot {
  start: string;
  end: string;
  status: string;
}

const HORIZON_DAYS = 14;
const SLOT_TIME = /^\d{2}:\d{2}$/;

function uniqueName(base: string): string {
  return `${base} ${Date.now()}`;
}

async function createEventType(request: APIRequestContext, name: string, duration: number) {
  const response = await request.post('/event-types', {
    data: { name: uniqueName(name), description: '', duration },
  });
  expect(response.status()).toBe(201);
  return (await response.json()) as { id: string; name: string };
}

async function listFreeSlots(request: APIRequestContext, typeId: string): Promise<Slot[]> {
  const from = new Date();
  const response = await request.get('/slots', {
    params: { typeId, from: from.toISOString(), to: addDays(from, HORIZON_DAYS).toISOString() },
  });
  expect(response.status()).toBe(200);
  const slots = (await response.json()) as Slot[];
  return slots.filter((slot) => slot.status === 'free');
}

function book(request: APIRequestContext, typeId: string, slotStart: string) {
  return request.post('/bookings', {
    data: { name: 'Борис', email: 'boris@example.com', typeId, slotStart },
  });
}

function dayButtonName(iso: string): string {
  const date = new Date(iso);
  return `${formatMoscowWeekday(date)}, ${formatMoscowDate(date)}`;
}

function time(iso: string): string {
  return formatMoscowTime(new Date(iso));
}

test('guest books a free slot and the owner sees the meeting', async ({ page }) => {
  const typeName = uniqueName('Консультация');

  // Owner creates an event type.
  await page.goto('/');
  await page.getByRole('link', { name: 'Новый тип' }).click();
  await page.getByLabel('Название').fill(typeName);
  await page.getByLabel('Описание').fill('Обсуждение проекта');
  await page.getByLabel('Длительность (минуты)').fill('30');
  await page.getByRole('button', { name: 'Создать' }).click();

  // Guest picks the type, a free slot in the calendar, and books it.
  const card = page
    .locator('div')
    .filter({ has: page.getByText(typeName, { exact: true }) })
    .filter({ has: page.getByRole('link', { name: 'Записаться' }) })
    .last();
  await card.getByRole('link', { name: 'Записаться' }).click();

  await expect(page.getByRole('heading', { name: typeName })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Выберите время' })).toBeVisible();
  const slot = page.getByRole('button', { name: SLOT_TIME }).first();
  const slotTime = (await slot.textContent())?.trim() ?? '';
  await slot.click();

  await page.getByLabel('Имя').fill('Анна');
  await page.getByLabel('Email').fill('anna@example.com');
  await page.getByRole('button', { name: 'Записаться' }).click();

  await expect(page.getByRole('heading', { name: 'Бронь подтверждена' })).toBeVisible();
  await expect(page.getByText(`${typeName}:`)).toContainText(slotTime);

  // Owner sees the meeting in the list of all bookings.
  await page.getByRole('link', { name: 'Брони' }).click();
  const row = page.getByRole('row').filter({ hasText: typeName });
  await expect(row).toContainText('Анна');
  await expect(row).toContainText('anna@example.com');
  await expect(row).toContainText(slotTime);
});

test('a slot booked for one type is busy for another type', async ({ page, request }) => {
  const call = await createEventType(request, 'Созвон', 30);
  const meeting = await createEventType(request, 'Встреча', 60);

  // Take a day (not the first one) whose 09:00, 09:30 and 10:00 slots are still free.
  const byDay = new Map<string, Slot[]>();
  for (const slot of await listFreeSlots(request, call.id)) {
    const key = moscowDayKey(new Date(slot.start));
    byDay.set(key, [...(byDay.get(key) ?? []), slot]);
  }
  const day = [...byDay.values()]
    .slice(1)
    .find((slots) => ['09:00', '09:30', '10:00'].every((t) => slots.some((s) => time(s.start) === t)));
  expect(day, 'a day with free morning slots').toBeDefined();
  const booked = day!.find((slot) => time(slot.start) === '10:00')!;

  expect((await book(request, call.id, booked.start)).status()).toBe(201);
  // The server rejects an overlapping booking of another type, too.
  expect((await book(request, meeting.id, booked.start)).status()).toBe(409);

  await page.goto(`/booking/${meeting.id}`);
  await page.getByRole('button', { name: dayButtonName(booked.start), exact: true }).click();

  // 10:00–11:00 and 09:30–10:30 overlap the booked 10:00–10:30; 09:00–10:00 does not.
  await expect(page.getByRole('button', { name: '10:00 · Занято' })).toBeDisabled();
  await expect(page.getByRole('button', { name: '09:30 · Занято' })).toBeDisabled();
  await expect(page.getByRole('button', { name: '09:00', exact: true })).toBeEnabled();
});

test('guest sees a conflict message when the slot is taken meanwhile', async ({
  page,
  request,
}) => {
  const demo = await createEventType(request, 'Демо', 30);
  const review = await createEventType(request, 'Разбор', 30);
  const [slot] = await listFreeSlots(request, demo.id);

  await page.goto(`/booking/${demo.id}`);
  await page.getByRole('button', { name: time(slot.start), exact: true }).click();
  await page.getByLabel('Имя').fill('Анна');
  await page.getByLabel('Email').fill('anna@example.com');

  // Someone books the same time through another event type before the guest submits.
  expect((await book(request, review.id, slot.start)).status()).toBe(201);
  await page.getByRole('button', { name: 'Записаться' }).click();

  await expect(page.getByRole('alert')).toContainText('Слот уже занят');
  await expect(page.getByRole('button', { name: `${time(slot.start)} · Занято` })).toBeDisabled();
});
