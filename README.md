# Календарь звонков (продолжение)


[![hexlet-check](https://github.com/kirill0991/ai-for-developers-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/kirill0991/ai-for-developers-project-387/actions)

Интегрируйте работу агентов в GitHub проект

Учебный проект Хекслета: https://ru.hexlet.io/programs/ai-for-developers
Как это должно работать: https://files.hexlet.app/a/2ipc5m

**Демо:** https://calendar-calls-c6yz.onrender.com (Render, бесплатный тариф: после простоя
первый запрос может идти до минуты, данные сбрасываются при перезапуске)

## Стек

- React 19 + TypeScript
- Vite
- Mantine
- Fastify + SQLite (better-sqlite3)
- TypeSpec (контракт API) → OpenAPI, JSON Schema, клиентский SDK (orval)
- Vitest + Testing Library
- ESLint (typescript-eslint)
- Архитектура: Feature-Sliced Design

## Установка

```bash
git clone https://github.com/kirill0991/ai-for-developers-project-387.git
cd ai-for-developers-project-387
npm install
```

## Использование

```bash
npm run dev          # запуск dev-сервера фронтенда (Vite)
npm run dev:server   # запуск бэкенда (Fastify) в watch-режиме
npm run start:server # запуск бэкенда (Fastify)
npm run generate     # генерация OpenAPI, JSON Schema и клиентского SDK из TypeSpec
npm run build        # production-сборка (tsc -b && vite build)
npm run preview      # предпросмотр production-сборки
npm test             # запуск тестов
npm run test:e2e     # E2E-тесты (Playwright), один раз: npx playwright install chromium
npm run lint         # проверка линтером
npm run typecheck    # проверка типов
```

Бэкенд слушает `http://localhost:3000`. В dev-режиме Vite проксирует
`/event-types`, `/slots` и `/bookings` на бэкенд, поэтому фронтенд и бэкенд
запускаются в двух терминалах (`npm run dev` и `npm run dev:server`).

## Docker

Образ собирает фронтенд и запускает Fastify, который отдаёт и API, и собранное SPA.
Порт задаётся переменной окружения `PORT` (по умолчанию `3000`).

```bash
docker build -t calendar-app .
docker run -p 8080:8080 -e PORT=8080 calendar-app
```

Переменные окружения:

- `PORT` — порт HTTP-сервера;
- `DB_PATH` — путь к файлу SQLite (по умолчанию `/app/data/calendar.db`);
  чтобы данные переживали пересоздание контейнера, смонтируйте том в `/app/data`.

<!-- Добавьте запись asciinema — именно это смотрит работодатель -->

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
