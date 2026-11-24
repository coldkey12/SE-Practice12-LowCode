# Shared requirement / acceptance-criteria sheet — Practice #12

One contract for **both** implementations (code-based in Bolt.new, low-code in Budibase).
Written **before** either implementation was built. Booking rules are the same as in the
earlier practices (AC1–AC6) and were not changed to favour either approach.

## User story

> As a **student**, I want to enter a future start time and a duration for the campus room
> and see **Available** or **Unavailable** with a clear reason, so that I know whether I can
> use the room, without changing any existing booking.

## Acceptance criteria (unchanged from the course slides)

| ID | Criterion |
|----|-----------|
| AC1 | Start time must be in the future. |
| AC2 | Duration must be greater than zero and at most 120 minutes. |
| AC3 | Overlapping bookings are unavailable. |
| AC4 | Blocked room is unavailable. |
| AC5 | Display a clear decision without changing existing bookings. |
| AC6 | Invalid input receives understandable feedback. |

## Inputs

| Input | Type | Notes |
|-------|------|-------|
| `start` | local date-time `YYYY-MM-DDTHH:MM` | required |
| `durationMinutes` | number | whole minutes; valid range 1–120 |
| `roomBlocked` | boolean | room-status control ("Room blocked" switch), default `false` |
| `bookings` | list of fictional bookings (below) | read-only |
| `now` | date-time | the real clock in the UI; fixed `2026-11-24T18:00` in automated tests |

## Fictional data (one room)

Room: **Room A-101 (fictional)**. Bookings, all on **2026-12-01**:

| ID | Title | Start | End |
|----|-------|-------|-----|
| B1 | Algorithms lecture | 09:00 | 10:30 |
| B2 | Study group | 12:00 | 13:00 |
| B3 | Robotics club | 15:00 | 16:30 |

No real personal data, no login, no payment, no production database.

## Outputs

| Output | Type | Meaning |
|--------|------|---------|
| `available` | boolean | `true` only for `AVAILABLE` |
| `reasonCode` | string (below) | machine-readable reason |
| `message` | string | the visible message shown to the student |

## Evaluation order and reason codes

Checks run in this order; the first failing check decides the result.
End = start + duration. Two intervals overlap when `start < bookingEnd && bookingStart < end`,
so touching edges (end == next start) are **not** an overlap.

| # | Reason code | Rule | Visible message |
|---|-------------|------|-----------------|
| 1 | `START_REQUIRED` | start empty or not a valid date-time (AC6) | Please choose a start date and time. |
| 2 | `START_IN_PAST` | start ≤ now (AC1) | Start time must be in the future. |
| 3 | `DURATION_NOT_NUMBER` | duration empty / not a whole number (AC6) | Duration must be a whole number of minutes. |
| 4 | `DURATION_NOT_POSITIVE` | duration ≤ 0 (AC2) | Duration must be greater than 0 minutes. |
| 5 | `DURATION_TOO_LONG` | duration > 120 (AC2) | Duration must be at most 120 minutes. |
| 6 | `ROOM_BLOCKED` | room blocked (AC4) | Unavailable: the room is blocked. |
| 7 | `OVERLAP` | overlaps a booking (AC3) | Unavailable: overlaps with "<title>" (<HH:MM>–<HH:MM>). |
| 8 | `AVAILABLE` | none of the above | Available: Room A-101 is free from <HH:MM> to <HH:MM>. |

Codes 1–5 are **validation errors** (AC6), 6–7 are **Unavailable** decisions, 8 is **Available**.
The check never writes to the booking list (AC5).

## Common test inputs (prepared before implementation)

| Test | start | duration | blocked | Expected available | Expected reason code |
|------|-------|----------|---------|--------------------|----------------------|
| T1 valid free interval | 2026-12-01 17:00 | 60 | no | true | `AVAILABLE` |
| T2 overlap with existing booking | 2026-12-01 12:30 | 60 | no | false | `OVERLAP` (Study group) |
| T3 blocked room | 2026-12-01 17:00 | 60 | **yes** | false | `ROOM_BLOCKED` |
| T4 duration = 0 | 2026-12-01 17:00 | 0 | no | false | `DURATION_NOT_POSITIVE` |
| T5 duration = 121 | 2026-12-01 17:00 | 121 | no | false | `DURATION_TOO_LONG` |
| T6 past start time | 2026-11-20 10:00 | 60 | no | false | `START_IN_PAST` |
| T7 adjacent non-overlapping | 2026-12-01 13:00 | 120 | no | true | `AVAILABLE` (13:00–15:00 touches B2 and B3) |
| T8 bookings unchanged | run T1–T7, compare the booking list before/after | – | – | – | list identical (3 bookings, same values) |

Machine-readable copy: [`test-cases.json`](test-cases.json).
