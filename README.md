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
`dev`, `build`, `typecheck`, `lint`, `test`, `test:watch`, `verify`.

## Configuration
See `.env.example`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEMO_MODE`, `VITE_TELEMETRY_URL`.

## Honest limitations
- Login is a demo gate; demo passwords are in the bundle. Do not use for real access control.
- CRUD edits are lost on reload (no persistence layer yet).
- Vehicle tracking is labelled DEMO unless `VITE_TELEMETRY_URL` returns data; staleness is shown.
- Maps use Leaflet (not MapLibre). Google tiles are not used.

See `docs/PROJECT_AUDIT.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_STATUS.md`.
