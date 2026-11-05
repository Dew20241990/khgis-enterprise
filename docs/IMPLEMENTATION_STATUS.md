# Implementation status

Last verified: 2026-11-05 (browser checks: 2026-11-04), branch `chore/stabilization-and-audit`.
`npm run verify` → typecheck OK, lint 0 problems, **236 tests passed (27 files)**, production build OK.

"Browser-tested" means exercised with Playwright/Chromium against the production build (`vite preview`).
No real GPS, satellite imagery, server-side authentication, cloud sync or backend persistence is configured or claimed.

## Phase 2 progress (i18n, persistence, RBAC, browser suite)

| Priority | Status | Evidence / what is missing |
|---|---|---|
| 1. Real i18n | **Partial — not complete** | Typed dictionaries (`defineModule`, compile-time key parity), `t()`, RTL/LTR, shared components and `SmartForm` (language switch keeps unsaved values, tested). Ratchet baseline: **1,004 hard-coded Arabic lines in 43 files, 356 language-ternary lines in 21 files, 81 Latin lines in 25 files**. In the browser, **35 of 41 routes still show Arabic text when the language is French** (most Arabic words visible in French mode: work-orders 294, inspections 272, reports 127, exec 117, audit-logs 101, illegal-dumping 88, shops 86, black-spots 83). Much of it is Arabic closed-set tokens in the demo fixtures (status, type, category names) rendered as-is, not only page text. Clean in French: `/`, `/ai-assistant`, `/settings`, `/epwg/gis`, `/epwg/service-areas`, `/epwg/reports`. |
| 2. Persistence boundary | **Not started** | CRUD edits live in memory and are lost on reload. No repositories, no versioned/validated storage. |
| 3. Auth / RBAC | **Partial** | `ROUTE_PERMISSIONS` (`src/App.tsx`) gates routes by role (6 demo roles). Action-level checks exist only on the work-orders page (`canEdit`); `CrudManager` has none. No service-layer permission tests; non-admin roles were not browser-tested. |
| 4. Committed Playwright suite | **Not started** | The browser checks below were run with scratch scripts that are **not committed** to the repository. |
| Procurement / stock, HR, accounting, QR, maintenance / fuel | **Not implemented** | — |

## Feature status

| Area | Status | Data / dependency |
|---|---|---|
| App shell, routing, themes | Browser-tested again on 2026-11-04: 42 routes × 5 viewport/language configs (210 page loads), 0 console/page errors, no horizontal overflow, no empty page; the only flagged route is the intentional `/nonexistent` → `/` redirect | — |
| Router base path | Fixed (see findings): `basename` = Vite `BASE_URL`; `404.html` fallback emitted by `postbuild` for static hosting | — |
| Sidebar | Browser-tested in AR/FR/EN: correct edge (right in AR), toggles, auto collapses < 1280 px and re-opens when enlarged, mobile drawer opens | — |
| Login | Browser-tested: redirect when signed out, wrong password error, valid login. **Demo gate only** (client-side, passwords in bundle) | Demo accounts |
| Main dashboard `/` | Browser-tested; figures derived from datasets (`lib/dashboardStats.ts`), identical across fresh loads | **Demo data** |
| Executive dashboard `/exec` | Renders; report cards export real CSV from the datasets (PDF/Excel/print buttons removed: not implemented) | **Demo data** |
| **AI assistant `/ai-assistant`** | **Rebuilt as an honest local analyser, not an AI.** Keyword matching (ar/fr/en, `src/i18n/assistantVocab.ts`) → four fixed analyses (`src/lib/assistantEngine.ts`): critical open black spots, containers above 90 % full, municipality performance (collection rate weighted by container count), black-spot concentration. Unknown questions get an explicit "not understood" answer. The chat stores structured answers, so a language switch relabels the history. Each result can be exported to CSV (exactly the displayed rows). Removed: the "connected · GPT-4o" claim, the canned reply with invented numbers, a hard-coded user name, the fake image analysis (stock photo with invented "87 %" overlays) and the dead attach/camera/report buttons. A notice states that no model is connected and nothing is sent anywhere. 52 unit/component tests (analysis engine 27, answer view 18, page 7); browser-tested in AR/FR/EN at 1440 px and EN/AR at 390 px, with every figure compared to values computed independently from the datasets (e.g. 160 containers, 12 above 90 %). | **Demo data**; no AI model |
| **Settings `/settings`** | **Rebuilt as a read-only status page.** Profile = the signed-in demo account (read-only). Language and theme really apply and are remembered in the browser. Notification preferences: five rows labelled "not implemented", no switches. Security: explanation only, no password/2FA form (no server could process it). Organisation: read-only, from the first municipality record. Integrations: ArcGIS/QGIS, payment gateway, citizen app, SMS = "not implemented"; Supabase and telemetry = "not configured", or "configured (not verified)" only when their `VITE_*` variables are set (`src/lib/integrations.ts`). Removed: the "Saved" button that saved nothing, the password/2FA forms, the always-on toggles, integrations shown as connected, and the hard-coded identity/organisation data. 10 tests; browser-tested in AR/FR/EN and at 390 px (no Arabic in FR/EN, no overflow). | Env vars only |
| **Inspection locations** | New observations no longer get random coordinates. Optional latitude/longitude fields are validated (in range, both or none, decimal comma accepted). Typed values are kept exactly. When empty, the municipality centre is used, never jittered, and the record says "Approximate position: municipality centre, not a field measurement". No GPS capture. 6 unit tests; browser-tested in EN/AR. | Municipality centres are **unverified demo values** |
| Truck tracking | Browser-tested: DEMO banner, CSV export downloads. Live mode only with `VITE_TELEMETRY_URL` (not verified against a real feed) | **Simulated positions** |
| GIS map (Leaflet) | Browser-tested: init, layer toggle adds features, layer search filter, feature click opens popup/identify, basemap switch (Esri tile host + attribution), 6× mount/unmount leaves one map, corrupted localStorage redirects safely | Bundled demo GeoJSON/KML |
| Basemap configuration | Unknown/invalid ids fall back to OSM (`resolveBasemap`, unit-tested); no Google tiles | Needs internet tile access (blocked in test sandbox, so tile imagery itself was not seen) |
| Operational CRUD modules (16) | Pages render and tables show rows; edits are in memory only (lost on reload) | **Demo data**, no persistence |
| Municipalities | Exactly 21, unique ids/codes/names in ar/fr/en (tested); names + 2008 populations from citypopulation.de | Areas, containers, rates, codes, polygons, centres are **unverified demo values** |
| GeoJSON assets | Regenerated from the dataset, byte-stable, valid WGS84 geometries, municipality names ⊆ the 21 (tested). Single `Commune_Boundary.kml` is an approximate polygon for Khenchela city only | **Not official boundaries**; map shows an "unverified" notice |
| Demo fixtures | Seeded (`lib/seededRandom.ts`): container status counts, coordinates, fuel, calendar are stable (pinned by tests) | Demo data |
| i18n | See "Phase 2 progress" above: partial, not complete | Phase 2 priority 1 |
| Auth, persistence, Supabase RLS | Client-side demo only; RLS open to `anon` (must be fixed before any real deployment) | Needs backend |

## Browser verification findings

### 2026-11-04 — honesty fixes (AI assistant, Settings, inspection locations)

Fixed:
1. The AI page claimed to be connected to GPT-4o and answered with canned text and invented numbers → local analyser with real, tested figures (see row above).
2. Settings had a Save button that only pretended to save, password/2FA forms with no backend, toggles that did nothing and integrations shown as active → read-only page showing true status (see row above).
3. New inspection observations received random map coordinates → typed coordinates or the flagged municipality centre.
4. Found while reviewing the screenshots: a hint in the "available analyses" card was cut off with an ellipsis (card subtitles are single-line) → now wraps; container codes such as `CTN-2131` broke at the hyphen on a 390 px screen → kept on one line (tested).

Verification (scratch Playwright scripts, **not committed**): 169 checks on the honesty pages, all passing, including a language switch that relabels earlier answers, CSV contents, rejection of invalid coordinates, and "no text cut off with an ellipsis"; plus the 42-route × 5-config crawl described in the first row of the feature table.

### 2026-10-27 — stabilisation

Fixed:
1. **Router had no `basename`** — with Vite `base: '/khgis-enterprise/'` every deep link and the post-login redirect left the app base path (all 40 routes redirected to `/`). Fixed in `App.tsx`; `404.html` fallback added.
2. `/exec` page overflowed horizontally by 44 px (report export buttons) — rebuilt as real CSV buttons.
3. `/exec` report cards had **non-functional** PDF/Excel/CSV buttons and "Print Preview" — now real CSV only.
4. Dashboard container-by-municipality chart overflowed on a 390 px French viewport (grid min-width) — fixed.
5. Data tables' pagination row overflowed on phones — now wraps.
6. GIS: legend and identify panel were drawn on top of the zoom buttons, and the wrapped toolbar row collided with side panels — repositioned; measured overlay overlaps on the final build at 1440×900: none.
7. GIS generator hard-coded the misspelling «خنشلا» in 3 layers — corrected; generator made deterministic.
8. Basemap component would throw on an unknown id — now falls back to OSM.

## Unresolved / not verified
- Hard-coded Arabic remains on most pages (see Phase 2 priority 1). Localisation must not be called complete.
- Map tile imagery could not be seen (sandbox blocks tile hosts); layout, layers and attribution were verified, imagery was not.
- Only the admin account was crawled; other roles' permission redirects were not browser-tested.
- Visual quality was reviewed from screenshots for the dashboard, login, tracking, GIS, AI assistant, settings and inspection details; the other pages were checked for errors/overflow, not for design.
- The live GitHub Pages site could not be opened from the build sandbox (outbound requests to `github.io` are blocked), so the deployed copy was not browsed; only the local production build was.
- No automated end-to-end test suite is committed.
- All pages are bundled into one 1.26 MB main chunk (242 kB gzip) next to the vendor chunks; routes are not lazy-loaded.
- `package.json` lists dependencies that nothing in `src` imports: `@mantine/core`, `@mantine/dates`, `@mantine/hooks`, `@mantine/notifications`, `react-hook-form`, `apexcharts`, `react-apexcharts`. `vite.config.ts` (`manualChunks`) still names the `@mantine/*` and `apexcharts` packages, so removing them also means editing that file.
- No CI workflow (`.github` does not exist).

## Recommended next phase
1. Phase 2 priority 1: move the remaining hard-coded Arabic to `t()` (start with work-orders, inspections, reports, exec, audit-logs, black-spots) and give the demo fixtures' closed-set tokens language-independent codes with translated labels.
2. Persistence boundary (typed repositories + versioned, validated localStorage adapter) so CRUD edits survive reload, then a real backend with proper RLS.
3. Action-level permission checks and service-layer RBAC tests; browser-test the non-admin roles.
4. Commit the Playwright suite (offline-safe) and run it in CI.
5. Obtain verified geodata (official commune boundaries/codes) to replace demo polygons.
6. Lazy-load the routes, and drop the unused dependencies together with their `manualChunks` entries.
