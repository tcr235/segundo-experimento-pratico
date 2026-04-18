## Task receipt

I will design a sequential, testable implementation plan (5 milestones), define the exact folder and file structure for `/sistema/frontend` and `/sistema/backend`, and produce acceptance criteria and developer notes so implementation can begin immediately.

## Checklist of explicit requirements (from `AGENTS.md`)

- [ ] Project split into `/sistema/frontend` and `/sistema/backend` with strict HTTP boundary.
- [ ] Milestone 1: Project setup and JSON persistence repository (backend).
- [ ] Milestone 2: Student and Class management features (backend APIs and frontend UI).
- [ ] Milestone 3: Goal evaluation system using MANA/MPA/MA.
- [ ] Milestone 4: Batched daily email notification system (Cron job, queue/registry).
- [ ] Milestone 5: Cucumber/Gherkin acceptance tests setup and scenarios.
- [ ] Provide exact folder & file structure for both frontend and backend.

If any item cannot be completed from available workspace files, it will be implemented in the repository as part of the milestones.

---

## High-level milestone plan (sequential, testable)

Milestone 1 — Project setup & JSON persistence repository (backend)
- Goal: Scaffold backend and frontend projects, create typed JSON repository (DAO) with safe concurrent read/write.
- Tasks:
  - Create `/sistema/backend` Node+TypeScript project (`package.json`, `tsconfig.json`, basic Express server).
  - Implement a generic `JsonRepository<T>` that exposes CRUD operations and uses advisory file-locking or atomic write strategy (write to tmp file then rename).
  - Define TypeScript `interfaces`/`types`: `Student`, `Class`, `Evaluation`, `GoalStatus` enum (`'MANA' | 'MPA' | 'MA'`).
  - Add unit tests for the repository (in-memory / temp-file tests) to exercise concurrent writes.
- Acceptance criteria / tests:
  - Repository can create/read/update/delete Student and Class JSON files without corrupting JSON under concurrent access (simulate with tests).
  - `npm run build` and `npm run start:dev` work.

Milestone 2 — Student & Class management (backend APIs + frontend UI)
- Goal: CRUD APIs in backend and a minimal React+TS frontend allowing management of students and classes, with strict HTTP-only communication.
- Tasks:
  - Backend: Implement REST endpoints
    - `POST /students` create, `GET /students`, `GET /students/:cpf`, `PUT /students/:cpf`, `DELETE /students/:cpf`
    - `POST /classes`, `GET /classes`, `GET /classes/:id`, `PUT /classes/:id`, `DELETE /classes/:id` and `POST /classes/:id/enroll` to add student by CPF.
    - Endpoints must validate input and return typed JSON.
  - Frontend: Vite + React + TypeScript app with pages/components:
    - Students list + create/edit form.
    - Classes list + create/edit form + enroll students UI.
    - View evaluations filtered by class (placeholder until Milestone 3).
  - Add E2E-style integration test (backend-only or lightweight script) that creates a student and a class, enrolls the student, and verifies JSON data.
- Acceptance criteria / tests:
  - Frontend communicates with backend only via fetch/XHR to the configured API base URL.
  - Backend API passes integration test; frontend can display lists and send create/update calls.

Milestone 3 — Goal evaluation system (MANA/MPA/MA)
- Goal: Implement evaluation domain model and API endpoints, plus frontend UI to set and view goal statuses per student/class.
- Tasks:
  - Add `Evaluation` model tied to Student and Class (structure: id, studentCpf, classId, goalName, status: GoalStatus, updatedAt).
  - Backend endpoints for evaluations: `POST /evaluations`, `GET /evaluations?studentCpf=...&classId=...`, `PUT /evaluations/:id`.
  - On update, record a pending notification entry for the student (see Milestone 4 design) but do NOT send email immediately.
  - Frontend: allow teacher/operator to set an evaluation status (MANA/MPA/MA) from a select control; show evaluation history and last updated time.
- Acceptance criteria / tests:
  - Correct TypeScript union/enum used for statuses.
  - Attempting to set an invalid status is rejected.
  - Updating evaluations registers pending notification entries (backend testable persistent store).

Milestone 4 — Batched daily email notification system using Cron Job
- Goal: Implement a scheduled job that runs once per day, aggregates all pending evaluation changes per student across classes, composes a single summary per student, and sends emails (or logs in dev) — then clears the pending entries.
- Tasks:
  - Implement a `PendingNotificationRepository` (JSON-backed) that accumulates evaluation-change events (studentCpf, evaluationId, classId, oldStatus?, newStatus, timestamp).
  - Use `node-cron` (or equivalent) to schedule a daily job (configurable cron expression in config file / env). For local dev, support a manual trigger endpoint `POST /admin/run-notifications`.
  - Implement an EmailService abstraction with two adapters: `ConsoleEmailAdapter` (dev) and `SmtpEmailAdapter` (configurable via env). The service must accept batched payloads and send exactly one email per student containing a summary of all changed evaluations since last run.
  - After successful send per student, remove sent pending entries atomically.
- Acceptance criteria / tests:
  - Running the scheduled job produces one summary email per student with all changed evaluations across their classes.
  - Manual trigger endpoint replicates scheduled run for acceptance tests.
  - Tests cover failure modes: if a per-student send fails, entries remain and are retried next run.

Milestone 5 — Cucumber/Gherkin acceptance tests
- Goal: Add Cucumber (Gherkin) acceptance tests covering the most important business scenarios, especially the batched email rule.
- Tasks:
  - Add `cucumber-js` to the backend test dependencies and place feature files under `/sistema/backend/test/features`.
  - Key feature scenarios to model:
    - Student creation and enrollment in a class.
    - Creating multiple evaluation updates for a student across classes in the same day then running the notification job -> expect one email with aggregated summary.
    - Partial and invalid status transitions are rejected.
    - Manual trigger sends and clears pending notifications; network/email adapter failures keep pending items for retry.
  - Provide step definitions in TypeScript that call the backend API endpoints directly (HTTP) to keep tests black-box.
  - Integrate `npm run test:acceptance` script.
- Acceptance criteria / tests:
  - All Gherkin features pass in CI/local run.

---

## Exact folder and file structure

Notes: keep frontend and backend strictly isolated. Each will have its own package.json and tsconfig.json.

Root:
- `AGENTS.md` (existing)
- `PLANNING.md` (this file)
- `/sistema`

/sistema/backend
- package.json              # scripts: build, start, dev, test, test:acceptance
- tsconfig.json
- src/
  - server.ts               # Express app bootstrap
  - config.ts               # env/config (API port, cron expression, email adapter env)
  - routes/
    - students.ts
    - classes.ts
    - evaluations.ts
    - admin.ts              # manual triggers for cron job (dev/testing only)
  - controllers/
    - studentController.ts
    - classController.ts
    - evaluationController.ts
    - adminController.ts
  - repositories/
    - jsonRepository.ts     # generic JsonRepository<T>
    - studentRepo.ts        # wrapper using JsonRepository<Student>
    - classRepo.ts
    - evaluationRepo.ts
    - pendingNotificationRepo.ts
  - services/
    - emailService.ts       # EmailService abstraction
    - notificationJob.ts    # cron job wiring and manual runner
    - evaluationService.ts  # business logic for evaluation updates (records pending entries)
  - models/
    - types.ts              # interfaces: Student, Class, Evaluation, GoalStatus enum
  - utils/
    - atomicFile.ts         # atomic write helpers, file lock helpers (simple advisory)
    - logger.ts
  - test/
    - unit/
      - jsonRepository.spec.ts
    - features/              # cucumber feature files
    - steps/                 # cucumber step definitions
  - data/
    - students.json         # persisted by repos (initially can be empty arrays)
    - classes.json
    - evaluations.json
    - pendingNotifications.json
- README.md

/sistema/frontend
- package.json              # scripts: dev, build, preview, test
- tsconfig.json
- vite.config.ts
- src/
  - main.tsx
  - App.tsx
  - pages/
    - StudentsPage.tsx      # list, create, edit
    - ClassesPage.tsx       # list, create, edit, enroll
    - EvaluationsPage.tsx   # view and edit goal statuses filtered by class
  - components/
    - StudentForm.tsx
    - ClassForm.tsx
    - EvaluationEditor.tsx  # select control for MANA/MPA/MA
    - ApiClient.ts          # wrapper for fetch calls (configurable base URL)
  - types/
    - models.ts             # mirror backend interfaces (Student, Class, Evaluation, GoalStatus)
  - assets/
  - test/
    - ui/
      - basic.spec.tsx      # lightweight React test(s)
- README.md

---

## Contracts (short)
- Student: { name: string, cpf: string, email: string }
- Class: { id: string, topic: string, year: number, semester: number, students: string[] /* cpfs */ }
- Evaluation: { id: string, studentCpf: string, classId: string, goal: string, status: GoalStatus, updatedAt: string }
- GoalStatus: 'MANA' | 'MPA' | 'MA'

Error modes: malformed JSON, concurrent writes, transient email failures — repository and job will be defensive.

## Edge cases and operational notes
- Multiple updates in one day across different classes -> must be coalesced in a single daily email per student.
- Updates that flip statuses rapidly should still be summarized as the latest status per evaluation in the daily email.
- If email sending fails for one student, do not delete their pending entries; log and retry next run.
- For local development, provide `ConsoleEmailAdapter` so devs see email content in logs instead of sending real emails.

## Quality gates (checklist before merge)
- [ ] Build: `backend: npm run build` and `frontend: npm run build` (both succeed)
- [ ] Lint/typecheck: `tsc --noEmit` passes for both projects
- [ ] Unit tests: repository unit tests pass
- [ ] Acceptance tests: cucumber features pass (Milestone 5)
- [ ] Smoke: manual-run notification endpoint behaves as scheduled job

## Dev notes and commands (advice)
- Set API base URL in frontend via environment variable VITE_API_BASE.
- For local acceptance tests, run backend in test mode with a temporary data folder (e.g. `--data-dir ./tmp-test-data`).
- To simulate daily cron during development, use the manual trigger endpoint `POST /admin/run-notifications`.

## Next steps (implementation sequence)
1. Scaffold `backend` with `package.json`, `tsconfig.json`, `src/models/types.ts` and `src/repositories/jsonRepository.ts` and add tests for atomic writes.
2. Scaffold `frontend` with Vite + React + TypeScript and the `ApiClient` wrapper.
3. Implement backend routes for students and classes and wire the frontend pages to them.
4. Implement evaluations domain and pending notification accumulation.
5. Implement cron job and email adapters; add manual trigger.
6. Add cucumber features and step definitions; wire `npm run test:acceptance`.

---

## Requirements coverage mapping
- Project split and isolation: Planned (will be enforced by separate package.json and CI checks).
- JSON persistence: Planned (JsonRepository + atomic writes).
- Student/Class entities and viewing evaluations: Planned (Milestone 2 & 3).
- MANA/MPA/MA evaluation model: Planned (Milestone 3).
- Batched daily email rule: Planned and tested (Milestone 4).
- Cucumber/Gherkin acceptance tests: Planned (Milestone 5).

---

If you want, I can now scaffold the `sistema/backend` and `sistema/frontend` starter files (package.json, tsconfig, basic src files and unit test skeletons) and run the initial build/tests. Which milestone should I start implementing first? 
