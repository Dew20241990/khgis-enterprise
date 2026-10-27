# Implementation status

Last verified: 2026-10-27, branch `chore/stabilization-and-audit`.
`npm run verify` → typecheck OK, lint 0 problems, **124 tests passed (15 files)**, production build OK.

"Browser-tested" means exercised with Playwright/Chromium against the production build (`vite preview`).
No real GPS, satellite imagery, server-side authentication, cloud sync or backend persistence is configured or claimed.

## Feature status

| Area | Status | Data / dependency |
|---|---|---|
| App shell, routing, themes | Browser-tested: 42 routes × 5 viewport/language configs, 0 console/page errors, no horizontal overflow | — |
| Router base path | Fixed (see findings): `basename` = Vite `BASE_URL`; `404.html` fallback emitted by `postbuild` for static hosting | — |
| Sidebar | Browser-tested in AR/FR/EN: correct edge (right in AR), toggles, auto collapses < 1280 px and re-opens when enlarged, mobile drawer opens | — |
| Login | Browser-tested: redirect when signed out, wrong password error, valid login. **Demo gate only** (client-side, passwords in bundle) | Demo accounts |
| Main dashboard `/` | Browser-tested; figures derived from datasets (`lib/dashboardStats.ts`), identical across fresh loads | **Demo data** |
| Executive dashboard `/exec` | Renders; report cards now export real CSV from the datasets (PDF/Excel/print buttons removed: not implemented) | **Demo data** |
| Truck tracking | Browser-tested: DEMO banner, CSV export downloads. Live mode only with `VITE_TELEMETRY_URL` (not verified against a real feed) | **Simulated positions** |
| GIS map (Leaflet) | Browser-tested: init, layer toggle adds features, layer search filter, feature click opens popup/identify, basemap switch (Esri tile host + attribution), 6× mount/unmount leaves one map, corrupted localStorage redirects safely | Bundled demo GeoJSON/KML |
| Basemap configuration | Unknown/invalid ids fall back to OSM (`resolveBasemap`, unit-tested); no Google tiles | Needs internet tile access (blocked in test sandbox, so tile imagery itself was not seen) |
| Operational CRUD modules (16) | Pages render and tables show rows; edits are in memory only (lost on reload) | **Demo data**, no persistence |
| Municipalities | Exactly 21, unique ids/codes/names in ar/fr/en (tested); names + 2008 populations from citypopulation.de | Areas, containers, rates, codes, polygons, centres are **unverified demo values** |
| GeoJSON assets | Regenerated from the dataset, byte-stable, valid WGS84 geometries, municipality names ⊆ the 21 (tested). Single `Commune_Boundary.kml` is an approximate polygon for Khenchela city only | **Not official boundaries**; map shows an "unverified" notice |
| Demo fixtures | Seeded (`lib/seededRandom.ts`): container status counts, coordinates, fuel, calendar are stable (pinned by tests) | Demo data |
| i18n | Dictionaries at parity. **37 of 42 pages still show hard-coded Arabic in FR/EN** (worst: work-orders, inspections, exec, reports, black-spots, audit-logs). Clean: `/`, `/epwg/gis`, `/epwg/service-areas`, `/epwg/reports` | Phase C |
| QR, maintenance/fuel, procurement/stock, HR, accounting | Not implemented | — |
| Auth, persistence, Supabase RLS | Client-side demo only; RLS open to `anon` (must be fixed before any real deployment) | Needs backend |

## Browser verification findings (2026-10-27)

Fixed:
1. **Router had no `basename`** — with Vite `base: '/khgis-enterprise/'` every deep link and the post-login redirect left the app base path (all 40 routes redirected to `/`). Fixed in `App.tsx`; `404.html` fallback added.
2. `/exec` page overflowed horizontally by 44 px (report export buttons) — rebuilt as real CSV buttons.
3. `/exec` report cards had **non-functional** PDF/Excel/CSV buttons and "Print Preview" — now real CSV only.
4. Dashboard container-by-municipality chart overflowed on a 390 px French viewport (grid min-width) — fixed.
5. Data tables' pagination row overflowed on phones — now wraps.
6. GIS: legend and identify panel were drawn on top of the zoom buttons, and the wrapped toolbar row collided with side panels — repositioned; measured overlay overlaps on the final build at 1440×900: none.
7. GIS generator hard-coded the misspelling «خنشلا» in 3 layers — corrected; generator made deterministic.
8. Basemap component would throw on an unknown id — now falls back to OSM.

Unresolved / not verified:
- Hard-coded Arabic on 37 pages in FR/EN (see i18n row).
- Map tile imagery could not be seen (sandbox blocks tile hosts); layout, layers and attribution were verified, imagery was not.
- Only the admin account was crawled; other roles' permission redirects were not browser-tested.
- Visual quality was reviewed from screenshots for dashboard, login, tracking and GIS only; the other ~35 pages were checked for errors/overflow, not for design.
- No automated end-to-end test suite is committed (the Playwright scripts used were scratch files).

## Recommended next phase
1. Phase C: move the hard-coded Arabic to `t()` (start with work-orders, inspections, exec, reports, black-spots).
2. Persistence boundary (repository layer + localStorage adapter) so CRUD edits survive reload, then a real backend with proper RLS.
3. Commit a small Playwright smoke suite to CI.
4. Obtain verified geodata (official commune boundaries/codes) to replace demo polygons.
