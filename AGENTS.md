# AGENTS.md

## Project Overview

Web system for academic management. The system allows the registration of students, classes, and the tracking of goal-based evaluations. It features local data persistence using JSON files and a batched email notification system for students.

## Tech Stack

- **Frontend:** React with TypeScript (Vite).
- **Backend:** Node.js with TypeScript (Express).
- **Database (Persistence):** Static JSON files (do not use external relational or NoSQL databases like PostgreSQL or MongoDB).
- **Acceptance Tests:** BDD using Cucumber and the Gherkin language.

## Directory Structure

The repository MUST be organized, clearly separating the client and the server within a root folder named `/sistema`:

- `/sistema/frontend`: Client web application (React). Must have its own `package.json` and `tsconfig.json`.
- `/sistema/backend`: API Server (Node.js). Must have its own `package.json` and `tsconfig.json`.
- **Strict Isolation:** Frontend code must never import files directly from the backend (and vice versa). Communication must occur strictly via HTTP requests (REST API).

## Business Rules and Domain

1. **Student Entity:** Every student has a Name, CPF, and Email.
2. **Class Entity:** Has a Topic (e.g., Introduction to Programming), Year, Semester, and a list of enrolled students. The system must allow viewing evaluations filtered by class.
3. **Evaluation System (Goals):** Grades are not numeric. The system strictly uses three concepts to evaluate goals (e.g., Requirements, Tests):
   - `MANA`: Meta Ainda Não Atingida (Goal Not Yet Achieved)
   - `MPA`: Meta Parcialmente Atingida (Goal Partially Achieved)
   - `MA`: Meta Atingida (Goal Achieved)
4. **Email Notifications (CRITICAL):** - The system MUST NOT send an email immediately upon each grade change.
   - Sending must be batched: the system must accumulate the changes made during the day and send **only one daily email** per student, containing a summary of all modified evaluations across all their enrolled classes.

## Architecture and Best Practices

- **JSON Manipulation:** Isolate the read/write logic for the JSON files in the backend using a generic _Repository_ or _DAO_ pattern, ensuring proper error handling for concurrent file access.
- **Scheduled Jobs:** For sending the daily emails, utilize _Cron Job_ patterns (e.g., the `node-cron` library) coupled with a queue or temporary registry of "pending notifications".
- **Strict Typing:** Leverage TypeScript by creating well-defined `interfaces` and `types` (`Student`, `Class`, `Evaluation`). Use an `enum` or literal type for the grading concepts (`MANA` | `MPA` | `MA`).

## Testing Guidelines

- Exclusively use Gherkin syntax to write acceptance tests in Cucumber.
- Focus on testing end-to-end business scenarios, paying special attention to the batched email rule and the correct assignment of goal concepts.
