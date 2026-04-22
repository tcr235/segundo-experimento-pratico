# Academic Management System

Short, practical backend + frontend system for managing students, classes and evaluations. It includes a small file-backed persistence layer and a daily-batched email notification prototype.

## Technologies

- Backend: Node.js + TypeScript + Express
- Frontend: React + TypeScript (Vite)
- Persistence: JSON files under `sistema/backend/src/data`
- Scheduler: `node-cron` (daily job to aggregate notifications)
- Acceptance tests: Cucumber / Gherkin with `@cucumber/cucumber`, `supertest` and `ts-node`

## Repository layout

- `sistema/backend` — backend application (Express + TypeScript)
- `sistema/frontend` — Vite + React frontend
- `PLANNING.md` — plan and decisions

## Prerequisites

- Node.js (>=16 recommended)
- npm

## Quick start

1. Backend

```bash
cd sistema/backend
npm install
# development (live reload)
npm run dev

# or build and run the compiled JS
npm run build
node dist/server.js
```

The backend exposes REST endpoints under `http://localhost:3000` by default.

2. Frontend

```bash
cd sistema/frontend
npm install
npm run dev
```

By default the frontend `ApiClient` points to `http://localhost:5173` (use `VITE_API_BASE` to override).

## Cucumber acceptance tests

Acceptance tests are located in `sistema/backend/src/test/features` with step definitions in `sistema/backend/src/test/steps`.

Run them from the backend folder:

```bash
cd sistema/backend
# recommended (uses ts-node to run TypeScript step defs)
npx cucumber-js --require-module ts-node/register --require src/test/steps/steps.ts -f progress ./src/test/features
```

Notes:

- Tests use `supertest` and the exported Express `app` so no separate server process is required.
- Tests reset the JSON data files in `sistema/backend/src/data` before each scenario. This is simple and practical for local use.

## Notification system — important observation

To make local development and testing easy, the email sending adapter currently logs composed emails to the backend console instead of sending via SMTP. The implementation lives in `sistema/backend/src/services/emailService.ts` and prints the full `to/subject/body` JSON when notifications are sent.

This means:

- No real emails are sent during local runs.
- You can validate the exact email content by checking backend logs (see below).

## How to test the email aggregation logic (step-by-step)

1. Start the backend (see Quick start). Use either `npm run dev` (recommended during development) or `node dist/server.js` after build.

2. Create a student and a class (you can create a class, student and an evaluation in the UI and just manually trigger the daily notification to test the email sender):

```bash
# create student
curl -X POST http://localhost:3000/students -H 'Content-Type: application/json' -d '{"name":"Alice","cpf":"000.000.000-00","email":"alice@example.com"}'

# create class
curl -X POST http://localhost:3000/classes -H 'Content-Type: application/json' -d '{"topic":"Intro","year":2026,"semester":1}'
```

3. Create multiple evaluations for the same student (these create _pending notification entries_ but do not send email immediately):

```bash
curl -X POST http://localhost:3000/evaluations -H 'Content-Type: application/json' -d '{"studentId":"<STUDENT_ID>","classId":"<CLASS_ID>","goal":"Requirements","status":"MANA"}'

curl -X POST http://localhost:3000/evaluations -H 'Content-Type: application/json' -d '{"studentId":"<STUDENT_ID>","classId":"<CLASS_ID>","goal":"Design","status":"MPA"}'
```

4. Manually trigger the daily notification aggregation (useful for testing):

```bash
curl -X POST http://localhost:3000/notifications/send-daily -H 'Content-Type: application/json' -d '{}'
```

5. Check the backend logs to inspect the composed email output. Where logs appear depends on how you started the server:

- If you used `npm run dev` / `npx ts-node-dev`: the composed email JSON will be printed in the terminal running the backend.
- If you used `node dist/server.js` and redirected logs, check the target log file (for example, if you started the server with `node dist/server.js &>/tmp/backend.log &` check `/tmp/backend.log`).

Example console output (truncated):

```
--- Sending email ---
{
  "to": "alice@example.com",
  "subject": "Daily evaluation summary",
  "body": "Hello Alice,\n\nHere is a summary of your evaluation updates for today:\n\n- Class <CLASS_ID>: Requirements -> MANA (at ... )\n- Class <CLASS_ID>: Design -> MPA (at ... )\n\nRegards,\nAcademic System"
}
```

After a successful run the pending notifications for that student are cleared from `sistema/backend/src/data/pendingNotifications.json`.

## Configuration

- `PORT` — backend port (default 3000)
- `VITE_API_BASE` — frontend env var used by the client to change API base URL
- `NOTIFY_DAILY_CRON` — cron expression to override the built-in daily schedule (default: `59 23 * * *`)

---

Generated on: 2026-04-21
