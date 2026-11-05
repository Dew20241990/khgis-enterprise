# KhGIS Enterprise (AURES AI)

React + TypeScript + Vite platform for urban cleaning and waste management in Khenchela province (Algeria).
Frontend-only SPA: business data is **demo/mock data held in memory**; there is no backend persistence,
server-side authentication or real GPS unless you configure and verify those integrations yourself.

## Quick start
```
npm ci
cp .env.example .env.local   # optional
npm run dev
npm run verify               # typecheck + lint + tests + build
```

## Scripts
`dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `test:watch`, `verify`, `i18n:audit`, `i18n:find`, `deploy`.

## Configuration
See `.env.example`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEMO_MODE`, `VITE_TELEMETRY_URL`.

## Deployment notes
- The app is served under `/khgis-enterprise/` (Vite `base`); the router uses the same base. `npm run build` also writes `dist/404.html` so deep links work on static hosts such as GitHub Pages.
- There is no CI workflow. The public site is the `gh-pages` branch, published by hand with `npm run deploy` (builds, then pushes `dist/`).
- Demo data is deterministic (seeded); regenerate map layers with `npx tsx scripts/gen-geojson.ts`.

## Honest limitations
- **Login is a demo gate** (client-side; the demo passwords are in the bundle). Do not use it for real access control. Roles decide which pages open; edit actions are permission-checked only on the work-orders page so far.
- **Data is demo data in memory.** CRUD edits are lost on reload (no persistence layer yet). Only a few UI settings are remembered, in this browser's `localStorage` (language, theme, sidebar state, the demo session's username, and autosaved form drafts that never include password fields); that storage is neither secure nor shared between users.
- **The "AI assistant" is not an AI.** It recognises a question by keywords (Arabic, French, English) and runs one of four fixed analyses on the demo data inside the browser: critical open black spots, containers above 90 % full, municipality performance, black-spot concentration. No model, no network call, no free-form chat, no image analysis, no attachments. Results can be exported to CSV.
- **Settings is a status page, not a control panel.** Only the language and the theme are applied. Profile and organisation are read-only. Notification preferences and four integrations (ArcGIS/QGIS, payment gateway, citizen app, SMS) are labelled "not implemented". There is no password or two-factor form, because nothing here could process it. Supabase and vehicle telemetry read "configured (not verified)" only when their environment variables are set.
- **Inspection locations are typed, not measured.** The inspector may enter latitude/longitude (validated). When left empty the municipality centre is used and the record is flagged as an approximate position. The app does not capture GPS.
- Vehicle tracking is labelled DEMO unless `VITE_TELEMETRY_URL` returns data; staleness is shown.
- **Translation is partial.** Typed Arabic/French/English dictionaries cover the shell, the shared components and some pages, but **35 of 41 routes still show some Arabic text when the language is French** (measured in the browser), and the source still has 1,004 hard-coded Arabic lines in 43 files, 356 language-ternary lines and 81 hard-coded Latin lines. A ratchet test stops these numbers from growing. See `docs/I18N.md`.
- Municipality boundaries, areas and container counts are unverified demo values; the map shows an "unverified" notice.
- Maps use Leaflet (not MapLibre). Google tiles are not used. Basemap imagery needs internet access.
- Not implemented: procurement/stock, HR, accounting, QR generation, maintenance and fuel.

See `docs/PROJECT_AUDIT.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/I18N.md`.
