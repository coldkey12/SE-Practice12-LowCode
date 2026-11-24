# Task #01 — Frozen baseline (code-based)

- Bolt project: https://bolt.new/~/sb1-kqaeymwj — Version 17 "Publish application" (24 Nov 18:53) = code of Version 16
  "Strictly validate time labels and availability" (Practice #10 final). Bookmarked in Bolt as the Practice #12 baseline.
- Live demo at baseline: https://smart-campus-room-ch-0k2r.bolt.host/ (screenshot 01_live_v16_baseline.png).
- Booking data (src/lib/data.ts): 5 fictional rooms (Curie Auditorium blocked), 6 fictional bookings
  (Athena Hall 101: 09:00–09:50, 11:00–11:50, 15:00–15:45; Newton Lab 220: 10:15–11:00; Turing Lab 305: 14:00–15:30;
  Da Vinci Studio: 13:30–14:30).
- Expected behaviour (AC1–AC6, unchanged): future start, 1–120 min, overlap → Unavailable (touching edges allowed),
  blocked room → Unavailable, decision shown without changing bookings, invalid input → clear message.
- Existing checks: npm test 26/26 pass in Bolt (03_bolt_baseline_tests.png) and locally (baseline_npm_test.txt);
  lint and typecheck pass; npm audit: 0 production / 24 dev-tool vulnerabilities.
- Booking rules were not changed to favour either approach.
