# Next Step Roadmap (Project Roast)

## Summary
The next step is to turn the current “single-step CSV import + placeholder analytics” into a complete end-to-end workflow: **Upload → Map/Validate → Import → Explore → Portfolio charts**, while keeping the app production-safe (no crashes, clear 4xx errors, and stable UI state).

This roadmap is organized as 4 sequential milestones that can be shipped independently, but together cover “do them all” with minimal rework.

## Current State Analysis (Grounded)
### Backend (FastAPI)
- CSV import endpoint: `POST /v1/trade-imports` in [trade_imports.py](file:///workspace/api/src/project_roast_api/routes/trade_imports.py).
- CSV parsing utilities: [trade_ingest.py](file:///workspace/api/src/project_roast_api/trade_ingest.py).
- Trades listing: `GET /v1/trades` in [trades.py](file:///workspace/api/src/project_roast_api/routes/trades.py) supports `symbol`, `side`, `dateFrom`, `dateTo`, pagination cursor.
- Portfolio metrics: `GET /v1/metrics/portfolio` in [metrics.py](file:///workspace/api/src/project_roast_api/routes/metrics.py) returns `kpis`, `equityCurve`, `drawdowns`.
- Ask AI: `POST /v1/ask` in [ask.py](file:///workspace/api/src/project_roast_api/routes/ask.py) is a stub that returns basic answers + a small evidence sample.
- Backtests: `POST /v1/backtests` in [backtests.py](file:///workspace/api/src/project_roast_api/routes/backtests.py) is a stub (returns `status=completed` with placeholder result).

### Frontend (Next.js)
- Upload UI is a single panel that directly calls `POST /v1/trade-imports` in [UploadPanel.tsx](file:///workspace/web/src/app/app/upload/UploadPanel.tsx).
- Trades UI reads `/v1/trades?limit=50` via React Query in [TradesTable.tsx](file:///workspace/web/src/app/app/trades/TradesTable.tsx).
- Portfolio shows KPI cards wired to metrics, but the “Equity Curve” section is currently a placeholder in [portfolio/page.tsx](file:///workspace/web/src/app/app/portfolio/page.tsx).
- Settings page explicitly calls out “CSV Templates” as “Coming next” in [settings/page.tsx](file:///workspace/web/src/app/app/settings/page.tsx).
- No charting library is currently present in [web/package.json](file:///workspace/web/package.json).

## Proposed Next Steps (Decision-Complete)

### Milestone 1 — Upload Wizard + Dynamic Mapping (UI + API)
Goal: Make upload robust and user-guided: auto-detect columns, allow manual override, validate before importing, and store the mapping used.

#### Backend changes
- Add a preview endpoint:
  - **New**: `POST /v1/trade-imports/preview`
  - Input: multipart `{ file }` (same as import)
  - Output:
    - `headers`: normalized header list
    - `suggestedMapping`: canonical→header mapping (based on alias system)
    - `requiredMissing`: list of canonical fields missing after auto-map
    - `sampleRows`: 10–25 normalized rows (as strings) for UI preview
    - `notes`: warnings such as “PnL missing → will default to 0”
- Extend import endpoint to accept mapping override:
  - Update `POST /v1/trade-imports` to accept an optional form field `mapping` (JSON string) or `mapping[...]` form fields.
  - Persist mapping into `TradeImport.mapping` (already exists in model).
  - Import logic:
    - If mapping override provided: use it as the source-of-truth.
    - Else: use auto-mapping.
  - Error handling:
    - Never raise 500 for bad user CSV. Return 400 with `detail` and `foundHeaders`.

Files:
- [trade_imports.py](file:///workspace/api/src/project_roast_api/routes/trade_imports.py): add preview route, accept mapping override.
- [trade_ingest.py](file:///workspace/api/src/project_roast_api/trade_ingest.py): expose “preview parse” helpers (header normalization, mapping suggestion, sample extraction).
- [schemas.py](file:///workspace/api/src/project_roast_api/schemas.py): add response models for preview + optional mapping input model (if using JSON body; if multipart-only, keep response model only).

#### Frontend changes
- Turn `/app/upload` into a 3-step wizard:
  1) Select file
  2) Preview + auto-mapping (editable)
  3) Import + status + “Go to Trades” / “Go to Portfolio”
- Add a mapping UI:
  - Render canonical required fields (symbol/side/qty/price/date) and optional fields (pnl/fees/strategy_tag).
  - Each canonical field is a dropdown bound to detected headers, defaulting to `suggestedMapping[canonical]`.
  - Live validation: show which required fields are unmapped.
- Submit import:
  - Upload file + mapping override to `POST /v1/trade-imports`.
  - On success, invalidate queries for `["trades"]` and `["metrics","portfolio"]` (already used).

Files:
- [UploadPanel.tsx](file:///workspace/web/src/app/app/upload/UploadPanel.tsx): refactor into wizard, call preview endpoint, send mapping override.
- Optionally add small UI components under `web/src/components/` (mapping row, preview table), keeping styling consistent.

Acceptance criteria
- Uploading any CSV never produces a 500 due to missing/unexpected column names.
- Users can successfully import by mapping columns even if headers don’t match the auto-detect aliases.
- Import record stores the mapping used (viewable via API; UI wiring can come later).

---

### Milestone 2 — Trade Explorer (Filters + Pagination)
Goal: Make Trades page useful for investigating imported data.

#### Frontend changes
- Add a sticky filter bar for:
  - symbol (text)
  - side (dropdown)
  - date range (from/to)
- Sync filters to URL query params (so tab switches/back/forward don’t reset state).
- Update React Query:
  - queryKey includes filters, e.g. `["trades", {symbol, side, dateFrom, dateTo}]`
  - Use cursor pagination (from backend’s `nextCursor`)

#### Backend changes (small)
- Ensure `strategyTag` is supported end-to-end:
  - Backend currently documents it in architecture docs but `GET /v1/trades` does not implement it.
  - Add query param `strategyTag` filter (optional).

Files:
- [TradesTable.tsx](file:///workspace/web/src/app/app/trades/TradesTable.tsx): filter UI + paginated querying.
- [trades.py](file:///workspace/api/src/project_roast_api/routes/trades.py): add optional `strategyTag` filter.

Acceptance criteria
- Trades remain visible across navigation and can be filtered reliably.
- Large imports are navigable via “Load more”.

---

### Milestone 3 — Portfolio Charts (Real Equity Curve)
Goal: Replace placeholder chart area with real data-driven charts.

#### Dependency decision (locked)
- Add a charting library (per your preference). Proposed: `recharts` (simple API for line/area charts).
- Keep charts client-only components to avoid SSR pitfalls.

#### Frontend changes
- Build `EquityCurveChart` using `metrics.equityCurve`.
- Build a small `DrawdownWidget` using `metrics.drawdowns` (even if currently minimal).
- Replace placeholder markup in [portfolio/page.tsx](file:///workspace/web/src/app/app/portfolio/page.tsx) with the real components.

Files:
- [PortfolioMetrics.tsx](file:///workspace/web/src/app/app/portfolio/PortfolioMetrics.tsx): keep KPI cards; charts can live in sibling components.
- [portfolio/page.tsx](file:///workspace/web/src/app/app/portfolio/page.tsx): wire in chart section.
- `web/package.json`: add chart dependency.

Acceptance criteria
- After import, Portfolio shows an actual equity curve line based on backend `equityCurve`.

---

### Milestone 4 — Ask AI + Backtests (Wire the “Coming next” Pages)
Goal: Convert stubs into “useful MVP” flows.

#### Ask AI
- Backend: expand `AskResponse.evidence` to include:
  - top symbols by count/pnl
  - simple aggregations (win rate, avg pnl, max loss, max win)
- Frontend: render evidence section below the answer (small table / bullets) instead of a single line.

#### Backtests
- Frontend: enable “Run” buttons to call `POST /v1/backtests`.
- Backend: keep stub results for now, but store parameters and return them to UI with a predictable shape for future engine replacement.

Acceptance criteria
- Ask AI produces structured evidence users can trust.
- Backtests page performs real API calls and shows stored results.

## Assumptions & Decisions
- Keep the current auth/token exchange flow unchanged.
- Continue using Postgres as the source of truth; no new infra required for these milestones.
- CSV “required schema” for a valid trade remains: timestamp, symbol, side, qty, price. `pnl` is optional and defaults to 0 for importability.
- Chart library is acceptable as a new dependency; we will validate React 19 compatibility during implementation.

## Verification Plan
### Backend
- Add unit tests for:
  - header normalization + alias mapping
  - preview endpoint returns expected structure and missing-field lists
  - mapping override imports correctly
  - `strategyTag` filter in `/v1/trades`
- Run: `PYTHONPATH=api/src pytest -q api/tests`

### Frontend
- Run: `pnpm -C web check`
- Manual smoke:
  - Upload CSV with weird headers → mapping UI appears → import succeeds
  - Navigate Upload → Trades → Portfolio; data remains and charts render
  - Apply filters on Trades and confirm results

## Suggested Execution Order
1) Milestone 1 (Upload wizard + preview/mapping) — unlocks reliable imports for everyone
2) Milestone 3 (Portfolio charts) — makes the app “feel real” immediately after import
3) Milestone 2 (Trade explorer filters) — enables investigation/debugging
4) Milestone 4 (Ask AI + Backtests) — turns placeholders into interactive flows

