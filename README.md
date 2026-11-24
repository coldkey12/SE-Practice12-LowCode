# Practice #12 — Compare code-based and low-code solutions (Don Vladimir, 24B030295)

Smart Campus Room Availability Checker implemented twice against **one shared contract**:
a code-based version in **Bolt.new** (React + TypeScript + Vitest) and a low-code version in
**Budibase Community 4.1.0** (self-hosted, free). Both were tested with the same eight cases T1–T8.

- Report (all tasks, prompts, full Bolt answers, test tables, comparison matrix, security checklist):
  [`report/Practice12_Don_Vladimir_24B030295.pdf`](report/Practice12_Don_Vladimir_24B030295.pdf)
- Live demo (code-based, Bolt Publish): https://smart-campus-room-ch-0k2r.bolt.host/
- Bolt project: https://bolt.new/~/sb1-kqaeymwj (V17 baseline → V18 first AI version → V19 final)

| Result | Code-based (Bolt) | Low-code (Budibase) |
|--------|-------------------|---------------------|
| T1–T8 (running UI) | 8/8 (first AI version 7/8) | 8/8 (published app 7/8 until prod data was seeded) |
| Unit tests | 45/45 (Vitest) | not available for bindings |
| Measured build + repair time | ≈ 12 min | ≈ 23 min |
| Unresolved defects | 1 minor ("24:30" end label) | 0 functional |
| Recommendation | **keep** | prototype only, with prod-data seeding + server-side permissions |

## Layout

| Path | Content |
|------|---------|
| `contract/` | Shared requirement / acceptance-criteria sheet (`CONTRACT.md`) and `test-cases.json` (written before both implementations) |
| `code-based/final-v19/` | Final Bolt source. Run: `npm ci && npm test` (45 tests), `npm run lint`, `npm run typecheck`, `npm run build` |
| `code-based/*.zip` | Bolt project downloads of V18 (first AI version) and V19 (final) |
| `low-code/budibase-export/` | Budibase workspace export (tar.gz, unencrypted, fictional data only) |
| `low-code/check_availability_binding.js` | The one JavaScript binding used by the Budibase button (v2, after the security fix); `_v1_` = before the fix |
| `low-code/Bookings.csv` | Fictional bookings imported into the Budibase table |
| `evidence/baseline/` | Task #01: baseline screenshot, Bolt version history, test runs, V16 source |
| `evidence/code/` | Code-based screenshots for T1–T8 (V18, V19, live site), probes, mobile, test logs, V18→V19 diff |
| `evidence/lowcode/` | Low-code screenshots for T1–T8 (dev preview and published), builder, backups/audit-log limits |
| `evidence/security/` | Security checklist, SAST/SCA output, DAST notes, XSS before/after screenshots |
| `evidence/prompts/` | Exact prompts sent to Bolt and Bolt's full answers |
| `evidence/timelog.txt` | Wall-clock time log used for the effort comparison |

## Re-creating the low-code instance (optional)

```bash
# secrets are generated locally and never committed
docker run -d --name p12-budibase --env-file low-code/budibase/.env \
  -p 127.0.0.1:10000:80 -v p12_budibase_data:/data budibase/budibase:latest
# then create a local admin and import low-code/budibase-export/*.tar.gz as a workspace
```

Note: restoring the export into a fresh instance was **not** tested in this practice (listed as an open risk in the report).

`low-code/budibase/.env` must define `JWT_SECRET, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, REDIS_PASSWORD,
COUCHDB_USER, COUCHDB_PASSWORD, INTERNAL_API_KEY, API_ENCRYPTION_KEY` (random values).

All data is fictional. No real personal data, login of real users, payment or production database.
