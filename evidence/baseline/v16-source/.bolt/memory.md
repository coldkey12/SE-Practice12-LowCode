# Project memory

## Product intent & audience

- Single-feature availability checker app: validates time labels and checks whether a time range is currently "available."
- User interacts by typing a current-time field and clicking a Check button; app compares against real clock time.

## Brand personality & voice

- User communicates in precise, scoped instructions (exact diffs, no side changes). Match that tone: concise, literal, no overreach.

## Visual design & UX direction

- Vite + React + JSX + Tailwind CSS + Lucide React icons (lucide-react) per template defaults.
- Import convention: use `@/` path alias mapping to `src/` (e.g., `@/lib/availability`), not deep relative paths.
- No extra UI/icon/theme packages unless explicitly requested.
- Time input is a text field; validation and checking are manual (Check button), not automatic.

## Decisions, constraints & rationale

- Time-label format: strictly `HH:MM` 24-hour, hours 00–23, minutes 00–59, with `24:00` also accepted. Invalid values (e.g., `10:75`) must be rejected rather than coerced.
- Availability check uses `max(typedCurrentTime, realClockTimeAtCheck)` to prevent past ranges from passing when the field is stale or set to an earlier time.
- User runs tests/type checks themselves; assistant should not execute commands unless asked.
- Diffs must be applied exactly as approved: no extra changes, no refactoring, no new installs, no publishing.

## Open questions & assumptions

- It is assumed the project has a test suite and type-check setup the user will run manually; specifics unknown.
- Exact UI layout/styling of the availability form has not been specified beyond Tailwind defaults; aesthetic direction is open until the user describes it.