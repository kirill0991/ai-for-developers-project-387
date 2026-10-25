# AGENTS.md

## What this repo is

Hexlet educational project (ru): «Календарь звонков» — упрощённый сервис бронирования времени по мотивам Cal.com.
Course: https://ru.hexlet.io/programs/ai-for-developers — expected behavior demo: https://files.hexlet.app/a/2ipc5m

This repo continues `kirill0991/ai-for-developers-project-386` (full history is preserved). The app is
done; this project moves agent work into the team's GitHub process: the agent runs in GitHub
Actions, answers in issues, opens pull requests and fixes them after review. Work items live as
GitHub issues; the roadmap is `docs/roadmap.md`.

## Stack

- Frontend: React 19 + TypeScript, Vite, Mantine UI, React Router
- Feature-Sliced Design (`src/app`, `src/pages`, `src/widgets`, `src/features`, `src/entities`, `src/shared`)
- Backend: Fastify + SQLite (`better-sqlite3`) in `server/`
- API contract: TypeSpec (`spec/main.tsp`) → OpenAPI, JSON Schema (`server/schemas/`) and
  client SDK via orval (`src/shared/api/generated.ts`). See ADR-0002.
- Vitest + Testing Library, ESLint (typescript-eslint)

## Architecture notes

- The frontend talks to the API only through the generated SDK, wrapped by entity functions
  (`src/entities/*/model`) that throw `ApiError` on unexpected statuses.
- Never edit `src/shared/api/generated.ts` by hand — change `spec/main.tsp` and run `npm run generate`.
- In dev, Vite proxies `/event-types`, `/slots` and `/bookings` to `http://localhost:3000`;
  browser navigations (HTML requests) fall through to the SPA.
- Times are shown in Moscow time (fixed UTC+3), see `src/shared/lib/time.ts`.
- The server validates that a booking starts on an offered slot (future, 30-minute grid,
  09:00–18:00, 14-day horizon) and rejects overlaps with 409. `buildApp({ now })` injects
  the clock in tests.
- In production one Fastify process serves both the API and the built SPA (`server/spa.ts`):
  HTML navigations get `index.html`, other requests hit the API or static files.

## Docker

- `Dockerfile` at the repo root builds the frontend and runs the server with `tsx`; the app
  listens on `PORT` (Hexlet's check and the hosting both set it). CI builds the image and
  smoke-tests it on `PORT=8080`.
- `npm ci --ignore-scripts` is intentional: `better-sqlite3` ships prebuilt binaries and its
  `node-gyp` fallback fails in the slim image.

## Deploy

- Render web service `calendar-calls` (Docker, free plan, Frankfurt), auto-deploys on push to
  `main` of the previous repo (`ai-for-developers-project-386`), not this one:
  https://calendar-calls-c6yz.onrender.com
- `.mcp.json` configures the Render MCP server; it reads the API key from `RENDER_API_KEY`.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start frontend dev server (Vite)
- `npm run dev:server` — start backend (Fastify) in watch mode on port 3000
- `npm run start:server` — start backend (`DB_PATH`, `PORT`, `HOST` env vars)
- `npm run generate` — regenerate OpenAPI, JSON Schema and client SDK from TypeSpec
- `npm run build` — production build (`tsc -b && vite build`)
- `npm run preview` — preview production build
- `npm test` — run all tests (`vitest run`)
- `npx vitest run src/app/app.test.tsx` — run a single test file
- `npm run test:e2e` — Playwright E2E (`e2e/`) against the production build with an in-memory
  DB; needs `npx playwright install chromium` once
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check (`tsc -b`)

## Hard constraints (from Hexlet)

- `.github/workflows/hexlet-check.yml` is auto-generated and runs Hexlet's project check on
  **every push to any branch/tag**. Never edit, delete, or rename it — or rename the repo —
  it breaks automated grading.

## CI

- `.github/workflows/ci.yml` — lint, typecheck, tests and build on every push and pull request,
  plus Playwright E2E and a Docker smoke test.
- `.github/workflows/release-please.yml` — automated releases via release-please; a release PR
  appears after a `feat`/`fix` commit lands in `main`.
- `.github/workflows/opencode.yml` — the OpenCode agent: runs on new issue and PR review comments
  that contain `/oc` or `/opencode`, acts through the OpenCode GitHub App (OIDC). Model: the
  `OPENCODE_MODEL` repo variable, falling back to `openrouter/openrouter/free` (OpenRouter's router
  over free models; single free models are often rate-limited); key from the
  `OPENROUTER_API_KEY` secret, which has a $0 credit limit.
- `.github/workflows/opencode-triage.yml` — auto-triage: on a newly opened issue the same agent
  gets a fixed prompt (the `issues` event has no comment text) and posts a comment with the cause,
  affected code, proposed fix and a suggested triage label. It does not change code. Authors with
  accounts younger than 30 days are skipped.

## Commit format

Conventional Commits only (`type: description`, lowercase, imperative). Allowed types:

- `feat` — new feature (SemVer minor)
- `fix` — bug fix (SemVer patch)
- `docs` — documentation only
- `style` — code formatting without logic changes
- `refactor` — code refactoring without bug fixes or features
- `perf` — performance optimization
- `test` — adding or changing tests
- `chore` — build, auxiliary tools, dependencies
- `build` / `ci` — build system or CI/CD changes

## Agent skills

### Issue tracker

Issues and specs live as GitHub issues (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles mapped to default label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
