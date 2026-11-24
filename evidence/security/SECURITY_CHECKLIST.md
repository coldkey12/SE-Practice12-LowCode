# Security checklist — Practice #12 (Lecture #12: SQLi, XSS, broken auth, sensitive-data exposure; SAST / DAST / SCA)

Scope: only my own artefacts — the Bolt.new project (code-based) and a Budibase Community instance that I run
locally in Docker (low-code). No third-party service was scanned. Runtime checks were manual and safe
(single requests, my own data, no load, no fuzzing).

| # | Check | Code-based (Bolt.new, React/TS) | Low-code (Budibase 4.1.0, self-hosted) |
|---|-------|---------------------------------|----------------------------------------|
| 1 | Input validation | Pure `validateInput` before any rule; covered by Vitest T4–T6 + edge tests | Number / date-picker controls + checks in the one JS binding; T4–T6 + empty duration pass |
| 2 | Output handling / XSS (SAST + DAST) | No `dangerouslySetInnerHTML` / `innerHTML` / `eval` in `src` (grep); React escapes text | **Found**: booking title reached the Markdown Text component as HTML (`<img>` rendered; `onerror` stripped by the sanitizer, no script ran). **Fixed** by escaping in the binding; re-test shows the tags as text. The Table component always showed the title as text |
| 3 | Injection (SQL/NoSQL) | No database, no queries | Rows read through the platform Data Provider; no custom query or query string built from input |
| 4 | Authentication / access | Public static site, no login, nothing to protect (fictional data) | App requires a Budibase login; anonymous row read → 302/401, anonymous write → 302; screen role "Basic user", table access "Admin user" |
| 5 | Hidden UI ≠ permission | n/a | Table component has Add/Edit/Delete off, but an admin session could still POST/DELETE rows through the API → real protection = table/role permissions |
| 6 | Public sharing / hosting | Bolt Publish site is public by design (bolt.host); project shared as Viewer link | Bound to 127.0.0.1 only (LAN IP refused); not exposed to the internet |
| 7 | Secrets | No `.env`, no keys, no network calls in `src` | Platform secrets in `low-code/budibase/.env` (chmod 600, git-ignored); none in the app or its export (checked) ; export warning: may contain datasource credentials — this app has none |
| 8 | Connectors / third-party | None | No external datasource; image bundles nginx, CouchDB, Redis, MinIO, Postgres + LiteLLM (AI proxy, unused) → larger attack surface |
| 9 | SCA / updates | `npm audit`: 0 production, 24 dev-tool vulnerabilities (2 low, 7 moderate, 13 high, 2 critical) — I own upgrades | Platform image `budibase/budibase:latest` (v4.1.0, built 2026-11-19); I own pulling updates; Docker Scout needs a Docker login, so no image CVE scan was run |
| 10 | Data environments | Single bundle | **Found**: Dev and Prod rows are separate → published app had 0 bookings and answered T2 "Available" (fail-open). Fixed with "Seed from Dev"; T1–T8 8/8 on the published app |
| 11 | Trust in "now" | Client clock (both) — a user can change the device clock to bypass AC1; acceptable for a fictional checker, a real system must check on the server | same |
| 12 | AI-agent least privilege | Bolt agent can edit every file and publish; I reviewed each diff and ran tests before publishing | Budibase AI features not enabled ("Switch on AI" left off) |
