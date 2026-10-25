# KhGIS Enterprise — Project Audit

Audit date: 2026-10-25
Audited commit: `cbee7a7` ("Fix Vite build configuration") on `main`
Audit branch: `chore/stabilization-and-audit`
Environment: Node v22.23.4, npm 10.9.9, Linux

> Scope note: the working copy is a **shallow clone** (`--depth 1`), so only one commit of history was
> visible. "What is implemented" below is derived from the source tree, not from commit history.

---

## 1. What the project actually is

A **frontend-only** React single-page application generated with the Bolt/Vite template
(`.bolt/config.json`: `bolt-vite-react-ts`). There is no backend server in the repository.

| Area | Actual state |
|---|---|
| UI | React 18, TypeScript (strict), Vite 5, Tailwind 3, Lucide, Framer Motion |
| Routing | `react-router-dom` v6, flat route table in `src/App.tsx`, per-route permission map |
| State | `zustand` store (`src/store/appStore.ts`) persisted to `localStorage` key `sanitation-app` |
| Maps | **Leaflet / react-leaflet** (not MapLibre). 10 files use `react-leaflet` |
| GIS data | 19 static files in `assets/gis/` (GeoJSON + KML), bundled via `import.meta.glob`, converted client-side with `@tmcw/togeojson` and `wellknown` |
| Charts | `recharts` (3 files). `apexcharts`/`react-apexcharts` are installed but unused |
| i18n | Home-grown dictionary in `src/i18n/translations.ts` (`ar`, `fr`, `en`) |
| Data | **All business data is in-memory mock data** (`src/data/mockData.ts`, `epwgData.ts`, `workflowData.ts`) |
| Supabase | Optional. Used only for (a) caching converted GIS layers and (b) writing audit-log rows. Silently disabled when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are unset |
| Tests | **None** (no test runner, no test files) |
| Docs | **None** (no README, no `docs/`, no `.env.example`) |
| Deploy | `gh-pages` script; `base: '/khgis-enterprise/'` |

Size: 16,657 lines of TypeScript/TSX under `src/`; 123 tracked files; 46 page components
(34 core + 12 under `epwg/`); 16 pages are built on the shared `CrudManager` framework.

---

## 2. Baseline verification (executed, not assumed)

| Command | Result |
|---|---|
| `npm ci` | ✅ exit 0 — 553 packages. 25 audit findings reported (2 low, 9 moderate, 14 high), **not yet triaged** |
| `npm run typecheck` | ✅ exit 0 — no TypeScript errors |
| `npm run lint` | ❌ exit 1 — **323 problems (314 errors, 9 warnings)** |
| `npm run build` | ✅ exit 0 — 3188 modules; main chunk **1,222 kB** (222 kB gzip) |
| Tests | ⚠️ not runnable — no test runner or tests exist |

Lint breakdown (314 errors):

| Rule | Count |
|---|---|
| `@typescript-eslint/no-unused-vars` | 195 |
| `@typescript-eslint/no-explicit-any` | 119 |
| `react-refresh/only-export-components` (warn) | 5 |
| `react-hooks/exhaustive-deps` (warn) | 4 |

Worst files: `DashboardPage.tsx` (60), `GisPage.tsx` (27), `SmartForm.tsx` (23), `CrudManager.tsx` (22),
`spatialEngine.ts` (19), `EnterpriseDataTable.tsx` (16), `importExport.ts` (11), `auditLog.ts` (11).

Browser-level checks (RTL/LTR rendering, map behaviour, navigation clicks) were **not** performed in
this audit: no browser is available in this environment.

---

## 3. Findings

### 3.1 Security (highest priority)

| # | Finding | Evidence |
|---|---|---|
| S1 | **Passwords are hard-coded in the client bundle** and every account uses the password `admin`. | `src/lib/auth.ts` (`MOCK_USERS`) |
| S2 | **The whole user object, including `password`, is persisted to `localStorage`** by the zustand `persist` middleware. | `src/store/appStore.ts` `partialize` includes `user` |
| S3 | The login page pre-fills credentials from `MOCK_USERS` (`setPassword(user.password)`). | `src/pages/LoginPage.tsx:109` |
| S4 | Authentication and authorization are entirely client-side. Anyone can edit `localStorage` to become `wali`/`admin`. This is a demo gate, **not** security. | `appStore.ts`, `ProtectedRoute` in `App.tsx` |
| S5 | Supabase RLS policies grant **full SELECT/INSERT/UPDATE/DELETE to `anon`** on both `gis_layers` and `audit_logs`. Anyone holding the public anon key can read, forge, or delete audit history. | `supabase/migrations/*.sql` |
| S6 | `npm audit`: 25 vulnerabilities, untriaged. | `npm audit` |
| ✅ | No API keys/private keys found by pattern scan of tracked files; `.env` is git-ignored. | `git grep` |

### 3.2 Data integrity and honesty of the UI

| # | Finding | Evidence |
|---|---|---|
| D1 | **"Live" truck tracking is random.** Positions are chosen with `Math.random()` over a path every interval, and speeds are random numbers rendered as if real. Nothing distinguishes it from real telemetry. | `src/pages/TruckTrackingPage.tsx:69-75,118,161` |
| D2 | **Municipality data conflicts with the product definition.** `mockData.ts` lists **26** municipalities (the brief specifies 21) and contains a **duplicate** (`Msara` as `M-15`, and again as `M-21`). Populations, areas and household counts are fictional (file header says so) but are not labelled as demo data in the UI. | `src/data/mockData.ts:35-62` |
| D3 | **CRUD edits are lost on reload.** `CrudManager` copies `data` into `useState`; no page passes `onDataChange`, so created/edited/deleted records exist only in component memory. | `CrudManager.tsx`, `grep onDataChange src/pages` → no matches |
| D4 | Audit logging is fire-and-forget to Supabase and is a no-op when env vars are absent, so by default **no audit trail exists**. | `src/lib/auditLog.ts` |
| D5 | Placeholder routes: `/exec/decisions` and `/exec/alerts` render `DashboardPage`; `/exec/rankings` renders `StatisticsPage`. They are not real pages. | `App.tsx:232-234` |
| D6 | **The "Excel" export button is mislabeled.** It calls `handleExport('xlsx')`, which falls through to the CSV branch and downloads a `.csv` file. No spreadsheet library is installed. | `EnterpriseDataTable.tsx:189-215,379` |
| D7 | **CSV export is vulnerable to formula injection**: cell values beginning with `=`, `+`, `-` or `@` are written verbatim and execute as formulas when opened in Excel/Sheets. Same for `importExport.ts`. | `EnterpriseDataTable.tsx:204`, `importExport.ts:18` |
| D8 | No QR generation; "print" is `window.print()` on the whole page (no print layouts). | grep |
| D9 | `EnterpriseDataTable` registers a global `document` click listener inside a `useState` initializer on every mount and never removes it (listener leak). | `EnterpriseDataTable.tsx:~222` |

### 3.3 Internationalisation

| # | Finding | Evidence |
|---|---|---|
| I1 | **117 Arabic keys have no French or English translation.** `ar` has 458 keys; `fr` and `en` each have 341. `translate()` falls back to `en`, then to the **raw key**, so French/English users see literal text such as `edit`, `delete`, `kpiOpenSpots`, `liveGps`. | `translations.ts`; verified by script |
| I2 | Many pages hard-code Arabic strings instead of using `t()` (e.g. `TruckTrackingPage`, `App.tsx` loading screen). | grep |
| I3 | `dir`/`lang` are set as a **side effect during render** in `AppLayout` (and again in `LoginPage`); this should be an effect. Charts/maps are not direction-aware. | `AppLayout.tsx:13-18` |
| I4 | Default locale is `ar`; locale and theme **are** persisted. | `appStore.ts` |

### 3.4 GIS

| # | Finding | Evidence |
|---|---|---|
| G1 | The stack is **Leaflet**, not MapLibre GL JS. The brief says "MapLibre where already used" — it is not used anywhere. Migrating is a major change and needs an explicit decision. | `grep maplibre` → 0 |
| G2 | **Tile attribution is wrong**: OSM, Esri and OpenTopoMap tiles are shown with `attribution="EPWG GIS"`. OSM/Esri/OpenTopoMap licences require their own attribution. | `EpwgGisPage.tsx:126,129`, `EpwgDashboardPage.tsx:100`, `EpwgServiceAreasPage.tsx:29` |
| G3 | All GIS files are loaded eagerly at startup into the main bundle (`import.meta.glob(..., eager: true)`), contributing to the 1.2 MB main chunk. An 8-second safety timeout hides loading failures silently (`.catch(() => {})`). | `gisLoader.ts:66-69`, `main.tsx` |
| G4 | No geometry validation or CRS check on imported data. | `gisLoader.ts`, `spatialEngine.ts` |
| G5 | `WILAYA_BOUNDARY` and municipality centres are **approximate hand-typed values**, not official boundaries. | `mockData.ts:8-13` |

### 3.5 Code quality / build

| # | Finding |
|---|---|
| Q1 | 314 lint errors (see §2). Most are dead imports; 119 are `any`. |
| Q2 | Unused dependencies: `@mantine/*` (4 pkgs), `apexcharts`, `react-apexcharts`, `react-hook-form`, `dayjs`, `@turf/turf` is imported in only 1 file. |
| Q3 | `vite.config.ts` `manualChunks` references the unused Mantine/ApexCharts packages (producing a 2 kB `mantine` chunk). Main chunk is 1.2 MB; no route-level code-splitting (all 40 pages imported statically in `App.tsx`). |
| Q4 | Two pages are not imported or routed anywhere: `DistrictsPage.tsx`, `TasksPage.tsx` (verified by grep; candidates for removal once you confirm they are obsolete). |
| Q5 | `.bolt/prompt` and `.bolt/config.json` are generator leftovers. |
| Q6 | No tests, no CI workflow, no README, no `.env.example`. |

---

## 4. Implementation status by requested area (summary)

Full detail lives in `docs/IMPLEMENTATION_STATUS.md`.

- **Present as UI over mock data:** municipalities, neighborhoods, black spots, illegal dumping, containers, shops/commercial violations, inspections, routes, work orders, vehicles, drivers, CET centres, contractors, complaints, reports, analytics, documents, users/roles/permissions, EPWG module (12 pages), AI-assistant page, settings.
- **Not present:** QR generation, maintenance schedules / fuel / service costs, procurement & stock, HR, accounting, real GPS integration, backend persistence, real authentication, tests, CI.

---

## 5. Prioritised plan

1. **Stabilise (Phase A):** zero lint errors; remove dead code/dependencies; keep typecheck+build green; add verification script.
2. **Security quick wins:** stop persisting credentials; stop pre-filling passwords; label the login as a demo gate; document RLS risk.
3. **Honesty fixes:** label simulated tracking as simulated; fix tile attribution; mark demo data.
4. **i18n:** add the 117 missing `fr`/`en` keys; move direction handling into an effect.
5. **Persistence layer:** introduce a repository boundary so CRUD changes persist (localStorage adapter now, backend later).
6. **Tests:** introduce Vitest for pure logic (spatial engine, import/export, i18n parity, auth).
7. **GIS decision:** keep Leaflet or migrate to MapLibre — requires owner decision.
