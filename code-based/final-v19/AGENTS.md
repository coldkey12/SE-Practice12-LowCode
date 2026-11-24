# AGENTS.md — Project Rules

## Scope

Fictional Smart Campus room-booking demo. Availability is checked for one selected fictional room at a time. Sample data ships five fictional rooms; do not remove them.

## Hard constraints

- No login, no authentication, no database. All data is in-memory sample data.
- No secrets, API keys, or .env files.
- No external deployments or network calls.
- Acceptance criteria (must be preserved):
  - AC1: Reject start >= end and requests in the past.
  - AC2: Enforce the maximum allowed duration (120 minutes).
  - AC3: Reject a blocked room.
  - AC4: Reject overlaps; allow bookings that only touch at endpoints.
  - AC5: Return Available / Unavailable without changing booking data.
  - AC6: Preserve clear UI feedback on desktop and mobile.

## Agent boundaries

- Allowed files: `src/**`, `src/lib/*.test.ts`, `AGENTS.md`, `README.md`, `test-runs/**`.
- Never edit `.bolt/**`, `package.json` dependencies or `package-lock.json` without human approval.
- Never add a database, login, Supabase, secrets or network calls, even if a tool suggests it.
- Never run `npm audit fix --force`.
- Never publish or deploy — only the human owner publishes.

## Review gates

- Read-only review in Plan mode first.
- Show a minimal diff and wait for human approval.
- No unrelated refactoring.
- After a change run: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` and paste the real output.
- Never report a test as passed unless it was actually run.
