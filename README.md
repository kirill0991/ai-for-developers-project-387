# Календарь звонков (продолжение)


[![hexlet-check](https://github.com/kirill0991/ai-for-developers-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/kirill0991/ai-for-developers-project-387/actions)

Интегрируйте работу агентов в GitHub проект

Учебный проект Хекслета: https://ru.hexlet.io/programs/ai-for-developers
Как это должно работать: https://files.hexlet.app/a/2ipc5m

**Демо:** https://calendar-calls-c6yz.onrender.com (Render, бесплатный тариф: после простоя
первый запрос может идти до минуты, данные сбрасываются при перезапуске)

Это продолжение проекта [«Календарь звонков»](https://github.com/kirill0991/ai-for-developers-project-386):
приложение перенесено вместе с историей, а работа с агентом переезжает в GitHub-процесс.
План развития — [docs/roadmap.md](docs/roadmap.md), задачи — в [issues](https://github.com/kirill0991/ai-for-developers-project-387/issues).

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

## Агент в GitHub

Агент — [OpenCode](https://opencode.ai/docs/github/) в GitHub Actions. Он отвечает в issue,
открывает pull request, правит их по ревью, ревьюит сам и раз в сутки проверяет скорость
приложения. Мержит и одобряет только человек. Правила для агента — в [AGENTS.md](AGENTS.md).

### Воркфлоу

| Воркфлоу | Чем запускается | Агент и модель | Права | Что делает | Прогоны |
|---|---|---|---|---|---|
| `opencode.yml` | `issue_comment` и `pull_request_review_comment` (`created`) с командой `/oc` от владельца или коллаборатора | `build`, `vars.OPENCODE_MODEL` | `id-token: write`, `contents: read` | ответ в issue, PR по задаче, правки в ту же ветку по комментариям | [Actions](https://github.com/kirill0991/ai-for-developers-project-387/actions/workflows/opencode.yml) |
| `opencode-triage.yml` | `issues: opened` (не от бота, аккаунт старше 30 дней) | `plan`, правки и bash запрещены | `id-token: write`, `contents: read` | разбор новой задачи: причина, затронутый код, путь, метка | [Actions](https://github.com/kirill0991/ai-for-developers-project-387/actions/workflows/opencode-triage.yml) |
| `opencode-review.yml` | `pull_request` (`opened`, `synchronize`, `reopened`, `ready_for_review`), не от бота | `plan`, из bash только `git diff/log/show` | `id-token: write`, `contents: read`, `pull-requests: write`, `issues: read` | авторевью по чек-листу в prompt | [Actions](https://github.com/kirill0991/ai-for-developers-project-387/actions/workflows/opencode-review.yml) |
| `lighthouse-audit.yml` | `schedule` `0 3 * * *` (06:00 МСК) и `workflow_dispatch` | `plan`, из bash только `gh issue` | `id-token: write`, `contents`, `pull-requests`, `issues: write` | Lighthouse по `vars.APP_URL`, отчёт в артефакт `lighthouse-report`, итоги — в issue | [Actions](https://github.com/kirill0991/ai-for-developers-project-387/actions/workflows/lighthouse-audit.yml) |
| `ci.yml` | `push`, `pull_request` | — | `contents: read` | lint, typecheck, тесты, сборка, E2E, Docker | [Actions](https://github.com/kirill0991/ai-for-developers-project-387/actions/workflows/ci.yml) |
| `release-please.yml` | `push` в `main` | — | `contents`, `pull-requests: write` | release-PR с changelog и версией | [Actions](https://github.com/kirill0991/ai-for-developers-project-387/actions/workflows/release-please.yml) |

Модель у всех агентов одна — `opencode/big-pickle`, бесплатная модель OpenCode Zen (ключ в
секрете `OPENCODE_API_KEY`). Задаётся переменной репозитория `OPENCODE_MODEL`, так что
поменять её можно без PR; запасная — `opencode/mimo-v2.6-flash-free`. `variant` не задан:
у бесплатных моделей нет уровней рассуждений.

### Решения

- **Модель.** Проект учебный, поэтому только бесплатные модели. Перепробовали: Zen
  `deepseek-v4.1-flash-free` — 403 «Model access is disabled» (модель отключена);
  OpenRouter `gemma-4-31b-it:free` — 429, `nemotron` — 404; роутер `openrouter/free`
  работал, но без кредитов даёт ~50 запросов в сутки, а каждый шаг агента — запрос, и лимит
  кончился за полдня. `big-pickle` справляется со всеми задачами проекта за 1–3 минуты.
- **Петли.** Ответ агента — тоже комментарий, поэтому во всех воркфлоу агента события от ботов
  (`user.type == 'Bot'`, `github.actor` с `[bot]`) и от `opencode-agent[bot]` отсекаются.
  Проверено: на ответ агента в #18 воркфлоу `opencode` запустился и был пропущен.
- **Команда вызова** задана явно и узко: `mentions: /oc`, то же условие в `if`.
- **Кто может звать.** Репозиторий публичный, поэтому `/oc` работает только от `OWNER`,
  `MEMBER` и `COLLABORATOR` (`author_association`); автотриаж пропускает аккаунты моложе 30 дней.
- **Права** выданы по воркфлоу. Интерактивный агент пишет в репозиторий токеном GitHub App
  (OIDC), поэтому ему хватает `id-token: write`. Авторевью комментирует токеном раннера, а он
  может комментировать PR только с `pull-requests: write`. Запись в `contents` и `issues` есть
  только у проверки по расписанию: звать её некому, и результат — issue — она создаёт сама.
- **Только чтение — настройками, а не просьбой.** Триаж, ревью и проверка по расписанию
  работают агентом `plan` с запретом правок в `OPENCODE_CONFIG_CONTENT`: action превращает любое
  изменение файлов в PR. Запросы разрешений тоже запрещены (`deny`): в CI на них некому
  ответить, и job висит до таймаута.
- **`share: false`.** Репозиторий открытый, но сессия агента публикуется по ссылке со всем
  контекстом. Пользы от публичных сессий нет, ход работы и так виден в комментариях и логах.
- **PR от агента и авторевью.** Action отказывает событиям, у автора которых нет прав на
  запись, в том числе `opencode-agent[bot]`. Поэтому push агента ревью не запускает, а чтобы
  получить ревью на PR агента, человек закрывает и переоткрывает его.

### Самооценка

С первого прохода:

- **#2 → PR #18.** По «Итоговой постановке» с чек-листом агент за полторы минуты сделал всё:
  `@maxValue(540)` в TypeSpec и перегенерация, сообщение в форме, тесты на сервер и клиент,
  заголовок в Conventional Commits, `Closes #2`.
- **Правки по ревью.** Общий комментарий (подсказка у поля) и комментарий к строке diff
  (константа вместо числа 540) — оба закрыты одним коммитом каждый в той же ветке.
- **Разборы.** `/oc explain` в #2 сразу нашёл причину (`lastStartMinutes` раньше 09:00);
  автотриаж #21 дал полный разбор со ссылками на код и заметил, что демо деплоится из
  другого репозитория.
- **Проверка по расписанию.** Первый же прогон дал отчёт #20 с пятью находками и причинами в коде.

Потребовали итераций:

- **Выбор модели** — четыре провайдера и модели до рабочей, см. «Решения».
- **«Код пока не меняй» не работает.** `/oc explain` в #2 вместо ответа открыл PR #12 с неверной
  правкой и лишним `package-lock.json`, заголовок не по Conventional Commits. Вывод: права
  отнимаются конфигом (`agent: plan`, `deny`), а формат заголовка просится явно — его пишет
  итоговое резюме агента.
- **Зависания в CI.** Запрос `external_directory` повесил триаж #13 на 10 минут → `deny` и
  `timeout-minutes`.
- **Авторевью** — 403 на комментарий (нужен `pull-requests: write`), отказ событиям от бота
  (#19), `concurrency` отменял ревью при push агента, разовый сбой самого action.

Итог: агент хорошо закрывает небольшие задачи с явной постановкой и чек-листом. Время уходит
не на код, а на настройку процесса вокруг агента: модели, права, триггеры.

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
