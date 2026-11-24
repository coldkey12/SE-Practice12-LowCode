#!/usr/bin/env python3
"""Builds report.html for Practice #12 from the evidence folder (real logs, prompts and Bolt answers are injected, not retyped)."""
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
EV = ROOT / "evidence"
SUBJECT = "AI-Driven Software Engineering Practice #12, Don Vladimir, 24B030295"
LIVE = "https://smart-campus-room-ch-0k2r.bolt.host/"
EDITOR = "https://bolt.new/~/sb1-kqaeymwj"
REPO = "https://github.com/coldkey12/SE-Practice12-LowCode"


def esc(s):
    return html.escape(s)


def pre(text, cls=""):
    c = f' class="{cls}"' if cls else ""
    return f"<pre{c}>" + esc(text.strip("\n")) + "</pre>"


def ev(rel):
    return (EV / rel).read_text(encoding="utf-8")


def fig(src, cap, style=""):
    st = f' style="{style}"' if style else ""
    return f'<figure><img src="../evidence/{src}"{st}><figcaption>{cap}</figcaption></figure>'


def row(*figs):
    return '<div class="row">' + "".join(figs) + "</div>"


def answer(rel):
    t = ev("prompts/" + rel)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return pre(t, "answer")


contract_md = (ROOT / "contract/CONTRACT.md").read_text()
binding = (ROOT / "low-code/check_availability_binding.js").read_text()
final = ROOT / "code-based/final-v19"
verdict_ts = (final / "src/lib/contract/verdict.ts").read_text()
validation_ts = (final / "src/lib/contract/validation.ts").read_text()
availability_ts = (final / "src/lib/contract/availability.ts").read_text()
contract_tests = ev("code/runs/v19_contract_tests_verbose.txt").replace("src/lib/contract/contract.test.ts > ", "")
v19_checks = ev("code/runs/v19_local_checks.txt")
fix_diff = ev("code/diffs/v18_to_v19.diff")
timelog = ev("timelog.txt")
dast = ev("security/lowcode_dast_api.txt")
static = ev("security/codebased_v16_static.txt")


def md_table(md, heading):
    """Very small markdown-table-to-HTML for the contract sheet."""
    sec = md.split(heading, 1)[1]
    lines = []
    for ln in sec.splitlines()[1:]:
        if ln.startswith("|"):
            lines.append(ln)
        elif lines:
            break
    out = ["<table>"]
    for i, ln in enumerate(lines):
        if i == 1:
            continue
        cells = [c.strip() for c in ln.strip("|").split("|")]
        tag = "th" if i == 0 else "td"
        cells = [re.sub(r"`([^`]+)`", r"<code>\1</code>", re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", esc(c))) for c in cells]
        out.append("<tr>" + "".join(f"<{tag}>{c}</{tag}>" for c in cells) + "</tr>")
    out.append("</table>")
    return "\n".join(out)


CSS = """
  :root { --ink:#1f2937; --muted:#6b7280; --line:#d1d5db; --ok:#047857; --bad:#b91c1c; --warn:#b45309; }
  @page { size: A4; margin: 14mm 12mm; }
  body { font: 10.1pt/1.45 -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color: var(--ink); background:#fff; margin:0; }
  h1 { font-size: 18pt; margin: 0 0 4px; }
  h2 { font-size: 13.5pt; margin: 18px 0 8px; padding-bottom: 3px; border-bottom: 2px solid var(--ink); break-after: avoid; }
  h3 { font-size: 11pt; margin: 12px 0 6px; break-after: avoid; }
  p { margin: 6px 0; }
  table { border-collapse: collapse; width: 100%; margin: 6px 0 10px; font-size: 8.6pt; }
  th, td { border: 1px solid var(--line); padding: 3px 5px; text-align: left; vertical-align: top; }
  th { background: #f3f4f6; }
  tr { break-inside: avoid; }
  code, pre { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 8pt; }
  pre { background: #f6f7f9; border: 1px solid var(--line); padding: 7px; white-space: pre-wrap; word-break: break-word; margin: 6px 0; }
  pre.answer { background: #fbfaf5; font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 8.4pt; }
  .meta td:first-child { width: 25%; font-weight: 600; background:#fafafa; }
  .pass { color: var(--ok); font-weight: 700; } .fail { color: var(--bad); font-weight: 700; } .warn { color: var(--warn); font-weight: 700; }
  .muted { color: var(--muted); }
  .note { border-left: 4px solid #f59e0b; background: #fffbeb; padding: 6px 10px; margin: 8px 0; }
  .decision { border: 2px solid var(--ok); background:#f0fdf4; padding: 8px 12px; margin: 8px 0; }
  figure { margin: 8px 0 12px; break-inside: avoid; }
  figure img { width: 100%; border: 1px solid var(--line); }
  figcaption { font-size: 8.4pt; color: var(--muted); margin-top: 3px; }
  .row { display: flex; gap: 10px; align-items: flex-start; break-inside: avoid; }
  .row figure { flex: 1; }
  .narrow img { max-height: 330px; width: auto; max-width: 100%; }
  .pb { break-before: page; }
  ul, ol { margin: 4px 0 6px 18px; padding: 0; }
"""

H = []
H.append(f"""<!doctype html><html><head><meta charset="utf-8"><title>Practice #12 — Don Vladimir 24B030295</title><style>{CSS}</style></head><body>
<h1>Practice #12 — Compare code-based and low-code solutions</h1>
<p class="muted">AI-Driven Software Engineering · Lesson #12 · Smart Campus Room Availability Checker · Lecture #12 security (SAST / DAST / SCA)</p>
<table class="meta">
  <tr><td>Student</td><td>Don Vladimir, ID 24B030295</td></tr>
  <tr><td>Email subject</td><td>{SUBJECT}</td></tr>
  <tr><td>Class time and day of week</td><td>Tuesday, 24 November 2026, 16:00–19:00</td></tr>
  <tr><td>AI tool, version, model</td><td><b>Bolt.new</b> (StackBlitz), Bolt Agent, mode <b>"Standard"</b>; build mode for the implementation prompt and the fix prompt, <b>Plan</b> on (read-only) for the comparison/review prompt. Free plan (14K daily tokens left after the 3 prompts). Bolt does not show the underlying model name.</td></tr>
  <tr><td>Code-based solution</td><td>Bolt project <code>{EDITOR}</code> · Version 17 = baseline (bookmarked) → V18 first implementation → V19 fixes → published.<br>Live demo (Bolt Publish): <a href="{LIVE}">{LIVE}</a></td></tr>
  <tr><td>Low-code solution</td><td><b>Budibase Community 4.1.0</b> (open-source, $0), self-hosted in Docker on my laptop, bound to <code>127.0.0.1:10000</code> only. App "Room Availability Checker" (published inside the local instance). No subscription bought.</td></tr>
  <tr><td>Repository</td><td><a href="{REPO}">{REPO}</a> — contract, both implementations (source + Budibase export), evidence, report</td></tr>
</table>

<h2>Result in short</h2>
<ul>
<li><b>Same contract</b> (one user story, AC1–AC6, inputs, outputs with reason codes and messages, 3 fictional bookings, T1–T8) was written <b>before</b> either implementation.</li>
<li><b>Code-based (Bolt):</b> first AI version V18 had unit tests <span class="pass">41/41</span> but the running UI scored <span class="fail">7/8</span> (OVERLAP labelled "Invalid input") and hid a date defect. One fix prompt → V19: unit <span class="pass">45/45</span>, UI <span class="pass">8/8</span> in preview and on the live site. 1 minor defect left open.</li>
<li><b>Low-code (Budibase):</b> <span class="pass">8/8</span> on the first run in the dev preview. My security check found <b>HTML injection</b> through the Markdown text (fixed), and the <b>published</b> app answered T2 "Available" because Dev and Prod data are separate (fail-open, fixed). After fixes 8/8 in preview and in the published app.</li>
<li><b>Measured effort</b> (wall clock, my time log): code-based ≈ 12 min, low-code ≈ 23 min (excluding the shared 18-min contract and a failed Docker image download).</li>
<li><b>Recommendation: keep the code-based solution</b> for this scenario (section 8). Low-code is fine for a quick internal prototype, but only with prod-data seeding and server-side permissions as mandatory steps.</li>
</ul>
""")

# ---------------- Task 01
H.append(f"""<h2 class="pb">1. Task #01 — Freeze the baseline</h2>
<p>The final code-based checker from the previous practices (Practice #10, Version 16 code) was opened in Bolt. The newest version, <b>Version 17</b> ("Publish application", same code as V16), was <b>bookmarked</b> as the Practice #12 baseline before any change.</p>
<table><tr><th>Item</th><th>Baseline value</th></tr>
<tr><td>Version</td><td>Bolt Version 17 (= V16 code "Strictly validate time labels and availability"), live at {LIVE}</td></tr>
<tr><td>Booking data</td><td><code>src/lib/data.ts</code>: 5 fictional rooms (Curie Auditorium blocked), 6 fictional bookings (Athena Hall 101 09:00–09:50, 11:00–11:50, 15:00–15:45; Newton Lab 220 10:15–11:00; Turing Lab 305 14:00–15:30; Da Vinci Studio 13:30–14:30)</td></tr>
<tr><td>Expected behaviour</td><td>AC1–AC6 as in the slides: future start, 1–120 min, overlap → Unavailable (touching edges allowed), blocked → Unavailable, clear decision without changing bookings, understandable feedback for invalid input</td></tr>
<tr><td>Existing checks</td><td><code>npm test</code> <span class="pass">26 passed (26)</span> in the Bolt terminal and locally; lint and typecheck pass; <code>npm audit</code>: 0 production, <span class="warn">24 dev-tool</span> vulnerabilities</td></tr>
<tr><td>Rule changes</td><td>None — booking rules were not changed to favour either approach.</td></tr>
</table>
{row(fig("baseline/01_live_v16_baseline.png", "Baseline screenshot: live site (V16 code) before Practice #12."), fig("baseline/02_bolt_versions.png", "Bolt version history: Version 17 bookmarked as baseline."))}
{fig("baseline/03_bolt_baseline_tests.png", "Existing checks in the Bolt terminal: npm test — 26 passed (26).")}
""")

# ---------------- Task 02
H.append(f"""<h2 class="pb">2. Task #02 — Shared requirement / acceptance-criteria sheet (common contract)</h2>
<p><b>User story.</b> As a <b>student</b>, I want to enter a future start time and a duration for the campus room and see <b>Available</b> or <b>Unavailable</b> with a clear reason, so that I know whether I can use the room, without changing any existing booking.</p>
<h3>Acceptance criteria (unchanged)</h3>
{md_table(contract_md, "## Acceptance criteria (unchanged from the course slides)")}
<h3>Inputs</h3>
{md_table(contract_md, "## Inputs")}
<h3>Fictional data — Room A-101 (fictional), all on 2026-12-01</h3>
{md_table(contract_md, "## Fictional data (one room)")}
<h3>Outputs</h3>
{md_table(contract_md, "## Outputs")}
<h3>Evaluation order, reason codes and visible messages</h3>
<p>First failing check decides. End = start + duration; overlap when <code>start &lt; bookingEnd &amp;&amp; bookingStart &lt; end</code>, so touching edges are not an overlap. Codes 1–5 are validation errors (AC6), 6–7 Unavailable, 8 Available. The check never writes to the booking list (AC5).</p>
{md_table(contract_md, "## Evaluation order and reason codes")}
<h3>Common test inputs (prepared before implementation)</h3>
{md_table(contract_md, "## Common test inputs (prepared before implementation)")}
<p class="muted">Machine-readable copy: <code>contract/test-cases.json</code>. Written 18:06–18:24 (18 min), before either implementation started.</p>
""")

# ---------------- Task 03
H.append(f"""<h2 class="pb">3. Task #03 — Code-based solution (Bolt.new)</h2>
<h3>3.1 Prompt 1 — implementation (the slide's suggested prompt + the contract)</h3>
<p>Sent in build mode at 18:57 as a pasted attachment (Bolt turns long pastes into an attachment) with one typed line. Full text: <code>evidence/prompts/P1_implementation_prompt.txt</code>. Beginning:</p>
{pre(ev("prompts/P1_implementation_prompt.txt").split("CONTRACT:")[0])}
<p class="muted">… followed by the whole contract from section 2.</p>
<h3>Bolt's answer (Version 18, 18:59)</h3>
{answer("P1_bolt_answer.txt")}
<h3>3.2 My verification of Version 18</h3>
<p>I downloaded the project, re-ran every check locally (same results as Bolt: 41/41, lint, typecheck, build) and then ran T1–T8 in the <b>running UI</b> (Bolt preview), plus one probe on another date.</p>
<table><tr><th>Check</th><th>Bolt's claim</th><th>Observed</th><th>Verdict</th></tr>
<tr><td>npm test</td><td>41 passed</td><td>41 passed (local and Bolt)</td><td class="pass">confirmed</td></tr>
<tr><td>lint / typecheck / build</td><td>pass</td><td>pass</td><td class="pass">confirmed</td></tr>
<tr><td>UI T2 (overlap)</td><td>"result card showing the verdict"</td><td>card says <b>"Invalid input"</b> with code OVERLAP</td><td class="fail">defect D1</td></tr>
<tr><td>Probe 2026-12-05 12:30 + 60</td><td>(not tested by Bolt)</td><td>OVERLAP with "Study group" — but that booking is on 12-01</td><td class="fail">defect D2: date ignored</td></tr>
<tr><td>Result line</td><td>—</td><td>"Requested: 2026-12-01 13:00, 13:00 onward." (no end time)</td><td class="warn">defect D3</td></tr>
<tr><td>T8 bookings unchanged</td><td>deep-compare test</td><td>list identical before/after T1–T7</td><td class="pass">confirmed</td></tr>
</table>
{row(fig("code/T2_code_v18.png", "V18, T2: reason code OVERLAP but verdict label 'Invalid input' (D1)."), fig("code/PROBE_other_day_code_v18.png", "V18, 2026-12-05 12:30: OVERLAP with a booking on another day (D2)."))}
<p>Why the 41 green tests missed it: the tests asserted only reason codes, and every case was on 2026-12-01. <b>Green unit tests did not mean a correct running app.</b></p>
<h3>3.3 Prompt 2 — fix (build mode, 19:02)</h3>
{pre(ev("prompts/P1b_fix_prompt.txt"))}
<h3>Bolt's answer (Version 19, 19:03)</h3>
{answer("P1b_bolt_answer.txt")}
<h3>3.4 Final structure (Version 19) — validation, availability and display are separate</h3>
<table><tr><th>Layer</th><th>File</th><th>Role</th></tr>
<tr><td>Data</td><td><code>src/lib/contract/data.ts</code></td><td>ROOM_NAME, 3 frozen fictional bookings, CONTRACT_DAY</td></tr>
<tr><td>Validation</td><td><code>src/lib/contract/validation.ts</code></td><td>pure <code>validateInput</code> → first error of codes 1–5, contract messages</td></tr>
<tr><td>Availability</td><td><code>src/lib/contract/availability.ts</code></td><td>pure <code>checkContract</code>: validation → ROOM_BLOCKED → OVERLAP (date-aware) → AVAILABLE; never mutates bookings</td></tr>
<tr><td>Verdict</td><td><code>src/lib/contract/verdict.ts</code></td><td>pure reason-code → "Available / Unavailable / Invalid input" mapping (added by the fix)</td></tr>
<tr><td>UI (display only)</td><td><code>src/components/ContractChecker.tsx</code></td><td>datetime-local, duration, "Room blocked" switch, result card, bookings list; responsive (max-w-2xl, stacks on 390 px)</td></tr>
<tr><td>Tests</td><td><code>src/lib/contract/contract.test.ts</code></td><td>T1–T8 with fixed now = 2026-11-24T18:00, 7 edge tests, 4 D1/D2 regressions</td></tr>
</table>
{pre(availability_ts)}
<h3>3.5 Running result (Version 19)</h3>
{pre(contract_tests)}
{pre(chr(10).join(l for l in v19_checks.splitlines() if re.search(r"###|Test Files|Tests |built in|error|✓ src", l)))}
{row(fig("code/T2_code_v19.png", "V19, T2: Unavailable · OVERLAP · contract message."), fig("code/PROBE_other_day_code_v19.png", "V19, 2026-12-05 12:30: Available (D2 fixed)."))}
<div class="row"><figure class="narrow"><img src="../evidence/code/mobile_390_code_v19.png"><figcaption>Narrow screen (390 px).</figcaption></figure>{fig("code/03_bolt_published_v19.png", "Republished with Bolt Publish (Update) — live site now runs V19.")}</div>
<p class="note"><b>Open defect R1 (minor):</b> for 2026-12-01 23:30 + 60 the message says "free from 23:30 to <b>24:30</b>" while the "Requested" line correctly says 23:30–00:30. The decision (Available) is correct; only the label does not wrap past midnight. Left open on purpose and counted as unresolved.</p>
""")

# ---------------- Task 04
H.append(f"""<h2 class="pb">4. Task #04 — Low-code solution (Budibase Community, self-hosted)</h2>
<p><b>Platform choice.</b> Budibase was on the course list and its Community edition is free to self-host (the Budibase Cloud plan starts at $299/month, so it was not used — no subscriptions bought). It runs as one Docker container (<code>budibase/budibase:latest</code>, v4.1.0) on my laptop, bound to <code>127.0.0.1</code>; the admin account is a local fictional one (<code>student@example.com</code>).</p>
<h3>Build steps (visual tooling)</h3>
<ol>
<li><b>Data:</b> Data tables → Upload CSV → table <b>Bookings</b> (booking_id, title, start, end) with the same 3 fictional bookings as the contract.</li>
<li><b>App + screen:</b> Create → App "Room Availability Checker"; screen layout set to <b>Flex</b> (the default Grid layout clipped the content — first layout bug).</li>
<li><b>Components:</b> Data Provider (Bookings) ▸ Text (heading) ▸ Form (custom schema, nothing is saved) with <b>Date Picker</b> "start" (time on), <b>Number Field</b> "duration", <b>Checkbox</b> "Room blocked (room status)", <b>Button</b> "Check availability", <b>Text</b> bound to <code>{{{{ State.result }}}}</code> ▸ <b>Table</b> of bookings with Add / Edit / Delete rows and row selection switched off.</li>
<li><b>Workflow:</b> button On click → <b>Update State</b> (key <code>result</code>) whose value is one JavaScript binding — the only script in the app ("small scripts only when necessary": the platform has no visual way to express "first failing rule wins" with overlap on dates).</li>
</ol>
{row(fig("lowcode/01_bookings_table.png", "Budibase DB table 'Bookings' created from CSV (fictional data)."), fig("lowcode/02_builder_screen.png", "Builder: component tree and the screen."))}
<h3>The JavaScript binding (version 2, after the security fix)</h3>
{pre(binding)}
<h3>Requirements the platform could not implement visually (recorded as asked)</h3>
<ul>
<li>Rule ordering and interval overlap on date-times → needed the JS binding above (no visual rule builder for this in the free edition).</li>
<li>Exact contract messages with values ("overlaps with "Study group" (12:00–13:00)") → string building in the binding.</li>
<li>Unit tests: Budibase has no test runner for bindings → T1–T8 could only be run through the UI.</li>
<li>Git versioning, backups (Premium) and audit logs (Enterprise) are not in the free edition (screenshots in evidence/lowcode/05–06).</li>
<li>Public hosting: the free self-hosted app is only on my laptop; there is no public demo link for the low-code version.</li>
</ul>
{row(fig("lowcode/T2_lowcode.png", "Low-code T2 (dev preview): Unavailable · OVERLAP · contract message."), fig("lowcode/mobile_390_lowcode.png", "Narrow screen: form stacks; the bookings table scrolls sideways.", "max-height:330px;width:auto"))}
""")

# ---------------- Task 05
lc = json.loads(ev("lowcode/test_results_lowcode.json"))
v19 = json.loads(ev("code/test_results_code_v19.json"))
v18 = json.loads(ev("code/test_results_code_v18.json"))
contract_rows = {
    "T1": ("2026-12-01 17:00, 60, not blocked", "Available · AVAILABLE"),
    "T2": ("2026-12-01 12:30, 60", "Unavailable · OVERLAP (Study group)"),
    "T3": ("2026-12-01 17:00, 60, blocked", "Unavailable · ROOM_BLOCKED"),
    "T4": ("2026-12-01 17:00, 0", "validation error · DURATION_NOT_POSITIVE"),
    "T5": ("2026-12-01 17:00, 121", "validation error · DURATION_TOO_LONG"),
    "T6": ("2026-11-20 10:00, 60", "validation error · START_IN_PAST"),
    "T7": ("2026-12-01 13:00, 120", "Available · AVAILABLE (13:00–15:00)"),
    "T8": ("run T1–T7, compare bookings", "bookings unchanged"),
}
trs = []
for r18, r19, rl in zip(v18["ui"], v19["ui"], lc["results"]):
    tid = r19["id"]
    inp, exp = contract_rows[tid]
    def cell(r):
        cls = "pass" if r["pass"] else "fail"
        return f'<td>{esc(r["observed"])} <span class="{cls}">{"PASS" if r["pass"] else "FAIL"}</span></td>'
    trs.append(f"<tr><td><b>{tid}</b></td><td>{esc(inp)}</td><td>{esc(exp)}</td>{cell(r18)}{cell(r19)}{cell(rl)}</tr>")
H.append(f"""<h2 class="pb">5. Task #05 — Identical tests: eight-case table (expected vs observed)</h2>
<p>Same inputs in both apps, typed into the <b>running UI</b> (code: Bolt preview; low-code: Budibase dev preview), real clock as "now" (24 Nov 2026, evening). To keep the runs identical and repeatable, the inputs were entered by a scripted browser (Playwright) and a screenshot was saved for every case. The code-based T1–T8 were also run as unit tests (fixed now) and repeated on the live site.</p>
<table><tr><th>Test</th><th>Input</th><th>Expected</th><th>Code-based V18 (first AI version)</th><th>Code-based V19 (final)</th><th>Low-code (Budibase)</th></tr>
{''.join(trs)}
<tr><th colspan="3">Score</th><th class="warn">7 / 8</th><th class="pass">8 / 8</th><th class="pass">8 / 8</th></tr>
</table>
<h3>Additional checks run on both</h3>
<table><tr><th>Check</th><th>Code-based</th><th>Low-code</th></tr>
<tr><td>Empty duration (AC6)</td><td class="pass">Invalid input · DURATION_NOT_NUMBER</td><td class="pass">Invalid input · DURATION_NOT_NUMBER</td></tr>
<tr><td>Other date 2026-12-05 12:30 + 60</td><td>V18 <span class="fail">OVERLAP (wrong)</span> → V19 <span class="pass">Available</span></td><td class="pass">Available (binding compares full date-times)</td></tr>
<tr><td>T1–T8 on the deployed version</td><td class="pass">8/8 on the live bolt.host site</td><td>published app: <span class="fail">T2 "Available" (empty prod table)</span> → after "Seed from Dev" <span class="pass">8/8</span></td></tr>
<tr><td>Unit tests</td><td class="pass">45/45 (Vitest)</td><td>not possible (no test runner for bindings)</td></tr>
</table>
{row(fig("lowcode/04_published_T2_before_prod_data.png", "Published low-code app before the fix: T2 answered 'Available' — the prod Bookings table was empty."), fig("lowcode/published_T2.png", "Published low-code app after 'Seed from Dev': T2 Unavailable · OVERLAP."))}
{row(fig("code/live_T2.png", "Code-based live site (bolt.host, V19): T2."), fig("code/live_T7.png", "Code-based live site: T7 adjacent 13:00–15:00 Available."))}
""")

# ---------------- Task 06
H.append(f"""<h2 class="pb">6. Task #06 — Engineering effort</h2>
<h3>Measured (wall clock from <code>evidence/timelog.txt</code>, minutes)</h3>
<table><tr><th>Phase</th><th>Code-based (Bolt)</th><th>Low-code (Budibase)</th></tr>
<tr><td>Setup</td><td>2 — open project, bookmark V17, run baseline tests (project already existed from earlier practices)</td><td>3 — start container, create local admin (image download failed ~20 min on network and was retried in the background; not counted)</td></tr>
<tr><td>Implementation</td><td>3 — prompt sent 18:57, Bolt done 18:59/19:00</td><td>9 — table, screen, form, binding, table component (18:29–18:38)</td></tr>
<tr><td>Debugging / repair</td><td>2 — fix prompt for D1–D3 (19:02–19:03)</td><td>6 — layout Grid→Flex (≈1.5), XSS escape fix incl. one failed save in a nested dialog (3.5), empty prod data (1)</td></tr>
<tr><td>Testing</td><td>5 — V18 UI run, V19 verification, live-site run</td><td>5 — first T1–T8, security probes, two re-runs (preview + published)</td></tr>
<tr><th>Total</th><th>≈ 12</th><th>≈ 23</th></tr>
<tr><td>Shared, not counted</td><td colspan="2">contract + common tests 18 min (18:06–18:24); report writing</td></tr>
<tr><td>Successful acceptance tests (final)</td><td class="pass">8 / 8 (first version 7 / 8)</td><td class="pass">8 / 8 (published version first 7 / 8)</td></tr>
<tr><td>Defects found / fixed / unresolved</td><td>4 found (D1, D2, D3, R1) / 3 fixed / <b>1 unresolved</b> (R1, minor label)</td><td>3 found (layout, HTML injection, empty prod data) / 3 fixed / <b>0 unresolved</b> functional (open risks in section 7)</td></tr>
<tr><td>AI prompts used</td><td>2 build + 1 read-only (Bolt Free: 14K daily tokens left)</td><td>0 (Budibase "Generate with AI" / "Switch on AI" not used)</td></tr>
</table>
<p class="note">There was a ~2 h pause in the session between 19:03 and 21:05 (no work); it is excluded. Low-code building was done with scripted browser steps, so a person clicking by hand would most likely need longer — that is an <b>impression</b>, not a measurement.</p>
<h3>How changes are reviewed, exported and version-controlled</h3>
<table><tr><th></th><th>Code-based (Bolt)</th><th>Low-code (Budibase Community)</th></tr>
<tr><td>Review</td><td>Every AI change is a new Bolt version; I downloaded V18/V19 and read a plain-text diff (<code>evidence/code/diffs/v18_to_v19.diff</code>, 4 files, +77/−18)</td><td>Changes are saved live in the builder (undo/redo only). The logic is stored <b>base64-encoded</b> inside the app definition, so a diff of two exports is not readable without decoding</td></tr>
<tr><td>Export</td><td>Project → Download (zip of a normal Vite + React project; runs with <code>npm ci && npm test</code>)</td><td>Settings → Export workspace (tar.gz with <code>db.txt</code> + client JS, 1.9 MB); restorable only into Budibase; warning that exports can contain datasource credentials (checked: none here)</td></tr>
<tr><td>Version control</td><td>Bolt version history with bookmarks (V17 baseline, V18, V19); the code can go to Git/GitHub (this repository)</td><td>No Git integration; <b>Backups = Premium</b>, <b>Audit logs = Enterprise</b>; Dev and Prod data are separate</td></tr>
</table>
<h3>Measured vs. impressions</h3>
<ul>
<li><b>Measured:</b> times above, test scores, defect counts, npm audit counts, HTTP status codes, file sizes.</li>
<li><b>Impression:</b> Budibase is quicker for a person who already knows the builder and needs a CRUD screen on an existing database; it felt slower here because the rule logic still had to be written as code, but without tests or a readable diff.</li>
<li><b>Impression:</b> Bolt's speed depends on the prompt; the vague part of the first result (verdict label) only surfaced through manual UI testing.</li>
</ul>
""")

# ---------------- Task 07
chk = (EV / "security/SECURITY_CHECKLIST.md").read_text()
H.append(f"""<h2 class="pb">7. Task #07 — Security review (Lecture #12) and checklist</h2>
<p>Scope: only my own artefacts — the Bolt project / my bolt.host site and the Budibase instance on my laptop. <b>No third-party service was scanned.</b> Runtime (DAST) checks were single manual requests and UI inputs against my own data, no fuzzing or load.</p>
{md_table(chk, "Scope:").replace("<table>", "<table>", 1) if False else ""}
""")
# checklist table (custom parse because the md has no heading before the table)
lines = [l for l in chk.splitlines() if l.startswith("|")]
tbl = ["<table>"]
for i, ln in enumerate(lines):
    if i == 1:
        continue
    cells = [c.strip() for c in ln.strip("|").split("|")]
    tag = "th" if i == 0 else "td"
    cells = [re.sub(r"`([^`]+)`", r"<code>\1</code>", re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", esc(c))) for c in cells]
    tbl.append("<tr>" + "".join(f"<{tag}>{c}</{tag}>" for c in cells) + "</tr>")
tbl.append("</table>")
H.append("\n".join(tbl))
H.append(f"""
<h3>SAST / SCA evidence (code-based)</h3>
{pre(static)}
<h3>DAST evidence (low-code, local instance only)</h3>
{pre(dast)}
{row(fig("security/lowcode_xss_check.png", "Before the fix: the booking title '&lt;img src=x onerror=…&gt;&lt;b&gt;bold&lt;/b&gt;' is rendered as HTML in the result (broken image). The table shows it as text."), fig("security/lowcode_xss_after_fix.png", "After escaping in the binding: shown as plain text, no element injected."))}
{fig("security/bolt_publish_dialog_security_audit_locked.png", "Bolt Publish dialog: the built-in 'Run security audit' is locked on the Free plan, so the security review relied on my own checks.", "max-height:280px;width:auto")}
""")

# ---------------- Comparison matrix + recommendation
H.append(f"""<h2 class="pb">8. Comparison matrix (completed with evidence) and recommendation</h2>
<table><tr><th style="width:17%">Criterion</th><th>Code-based (Bolt.new, React/TS)</th><th>Low-code (Budibase Community)</th></tr>
<tr><td>Functional tests</td><td><b>8 / 8</b> (V19 preview + live; first AI version 7 / 8) · unit 45 / 45</td><td><b>8 / 8</b> (dev preview first run; published app 7 / 8 until prod data was seeded)</td></tr>
<tr><td>Build and repair time</td><td><b>≈ 12 min</b> (setup 2, implementation 3, repair 2, testing 5)</td><td><b>≈ 23 min</b> (setup 3, implementation 9, repair 6, testing 5)</td></tr>
<tr><td>Customization</td><td>Full: any rule, message, layout; responsive card UI; reason-code badge</td><td>Fixed component set; rules needed a JS binding anyway; Grid layout clipped content until switched to Flex; bookings table scrolls sideways on a phone</td></tr>
<tr><td>Security controls</td><td>Static site, no backend / secrets / user data; React escapes text; no raw-HTML sinks (grep); 0 production vulnerabilities, 24 dev-tool; site is public by design; Bolt security audit locked on Free</td><td>Login + roles; anonymous API read 401/302, write refused; 127.0.0.1 only. Found: HTML injection via Markdown text (fixed), admin session can write rows through the API although the UI hides it, fail-open on empty prod data (fixed). Platform bundles 6+ services that I must patch</td></tr>
<tr><td>Versioning / portability</td><td>Bolt versions + readable diffs; standard Vite project, runs anywhere (<code>npm ci && npm test</code>), static hosting</td><td>No Git; export tar.gz only restorable into Budibase; logic base64-encoded; backups Premium, audit logs Enterprise; Dev/Prod data split must be managed</td></tr>
<tr><td>Ongoing cost</td><td>$0: Bolt Free (token-limited: 3 prompts left 14K daily tokens) + free bolt.host; Pro needed for private sharing / security audit</td><td>$0 licence (Community self-host) but I run and update a 1.2 GB Docker image with nginx, CouchDB, Redis, MinIO, Postgres, LiteLLM; Budibase Cloud from $299 / month</td></tr>
</table>
<div class="decision"><b>Recommendation: keep the code-based solution for the Smart Campus checker.</b> Both reached 8 / 8, but the code-based version did it in about half the measured time, its rules are covered by 45 re-runnable tests, changes are reviewable as plain diffs, and the deployed result is a static page with nothing to attack. The low-code version is a valid fast prototype, and its login/role model would matter for real data — but in this test it produced the more dangerous failures (fail-open after publishing, HTML injection, a write path the UI does not show), and its logic cannot be unit-tested or diffed. Use low-code only for internal CRUD screens on existing databases, with two mandatory controls: seed/verify Prod data after every publish, and enforce permissions on the table/API, not in the UI.</div>
<p class="muted">The decision is defended with the observed evidence above; Bolt's own comparison (section 9) reached the same recommendation, but I checked its claims separately.</p>
""")

# ---------------- AI reflection
H.append(f"""<h2 class="pb">9. AI-use reflection (Bolt.new)</h2>
<h3>Prompt 3 — comparison and review (the slide's suggested prompt, Plan mode = read-only)</h3>
<p>Prompt: <code>evidence/prompts/P2_comparison_prompt.txt</code> (the suggested prompt + a description of the Budibase app + my measured evidence). Bolt's full answer:</p>
{answer("P2_bolt_answer.txt")}
<h3>How I checked Bolt's claims</h3>
<table><tr><th>Bolt claim</th><th>My check</th><th>Verdict</th></tr>
<tr><td>"Implemented exactly", 41/41, lint/typecheck/build pass (P1)</td><td>Re-ran locally: identical numbers</td><td class="pass">confirmed</td></tr>
<tr><td>"Result card showing the verdict" (P1)</td><td>UI T2 showed "Invalid input" for OVERLAP; date ignored</td><td class="fail">incomplete — 2 defects</td></tr>
<tr><td>"All three defects are fixed", 45/45 (P1b)</td><td>Re-ran locally + UI 8/8 + probes; midnight label still "24:30"</td><td class="pass">confirmed</td> </tr>
<tr><td>"no escape hatches like dangerouslySetInnerHTML" (P2)</td><td>grep over <code>src</code>: none</td><td class="pass">confirmed</td></tr>
<tr><td>Budibase logic "edited live … with no version history" (P2)</td><td>Backups = Premium, Audit logs = Enterprise, no Git; builder has only undo/redo</td><td class="pass">confirmed for the free edition</td></tr>
<tr><td>"Injection fix covers only the path you re-tested" (P2)</td><td>XSS screenshot shows the Table component renders the same title as text → only the Markdown text was affected</td><td class="warn">partly verified (Table safe, other components not tested)</td></tr>
<tr><td>"half the measured time" (P2)</td><td>Numbers are mine, but the code-based side reused a project built over six practices and Bolt did the typing; not a like-for-like comparison</td><td class="warn">plausible, with a bias</td></tr>
<tr><td>Fail-open on empty data / API writes / timezone dependence (P2 risks)</td><td>First two observed by me; timezone not tested (one browser, Asia/Almaty)</td><td>2 confirmed, 1 unverified</td></tr>
</table>
<h3>Reflection</h3>
<ul>
<li><b>What helped:</b> Bolt turned the written contract into separated, typed modules and 15 tests in about 1.5 minutes, reported real command output, and its read-only review listed unsupported assumptions honestly (e.g. "8/8 first run" applies to the dev preview only).</li>
<li><b>What went wrong:</b> the first AI version passed every unit test and still failed T2 in the running UI and ignored dates. The fix only worked well because my prompt contained exact reproductions. <b>Green tests from the AI are not evidence of correct behaviour</b>; UI acceptance tests on the same contract were what found the defects.</li>
<li><b>Low-code is not secure because it is low-code:</b> the platform's sanitizer stopped script execution, but HTML injection, a hidden write path and a fail-open deployment were all real and were found only by testing.</li>
<li><b>Least privilege for the AI agent:</b> Bolt can edit every file and publish; I kept the review prompt in Plan mode, bookmarked the baseline, read the diff and re-ran the checks before republishing. No secrets were placed in prompts or screenshots (the Budibase secrets live in a git-ignored <code>.env</code>).</li>
</ul>
""")

# ---------------- Labels
H.append(f"""<h2>10. Incomplete or simulated behaviour (clearly labelled)</h2>
<ul>
<li><b>Nothing in either app is simulated</b>: both evaluate the inputs with real logic on the fictional data; all results above are observed outputs.</li>
<li><b>Low-code — local only:</b> the published Budibase app runs on my laptop (<code>127.0.0.1:10000</code>); there is no public link. The submission therefore includes the Budibase export and screenshots instead of a live URL.</li>
<li><b>Low-code — no automated tests:</b> T1–T8 were run through the UI only (no test runner for bindings).</li>
<li><b>Low-code — mobile:</b> usable at 390 px, but the bookings table scrolls sideways.</li>
<li><b>Code-based — open defect R1:</b> end label "24:30" for intervals crossing midnight (decision itself correct).</li>
<li><b>Both:</b> "now" is the browser clock; a user who changes the device clock can bypass AC1 (acceptable for fictional data, a real system must check on the server). Timezone behaviour was not tested.</li>
<li><b>Not done:</b> container image CVE scan (Docker Scout requires a Docker login); Bolt's built-in security audit (paid).</li>
</ul>
<h2>Appendix — time log</h2>
{pre(timelog)}
<h2>Appendix — fix diff V18 → V19 (from the Bolt exports)</h2>
{pre(fix_diff[:9000] + ("\n… (truncated, full diff in evidence/code/diffs/v18_to_v19.diff)" if len(fix_diff) > 9000 else ""))}
</body></html>""")

out = ROOT / "report/report.html"
out.write_text("\n".join(H), encoding="utf-8")
print("wrote", out, len(out.read_text()))
