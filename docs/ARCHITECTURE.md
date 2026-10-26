# Architecture

- **UI**: React 18, Tailwind, Lucide, Framer Motion; routes in `src/App.tsx` guarded by `ProtectedRoute` + a path→permission map.
- **State**: zustand store `src/store/appStore.ts` (persist v2: locale, theme, sidebar, username only; user rebuilt via `findSessionUser`).
- **CRUD framework**: `components/ui/CrudManager`, `SmartForm`, `EnterpriseDataTable`; helpers in `lib/formValues.ts`, `lib/csv.ts`.
- **GIS**: Leaflet/react-leaflet; basemaps + attribution in `lib/basemaps.ts`; spatial ops (Turf v7) in `lib/spatialEngine.ts`; validation in `lib/geometry.ts`; import/export in `lib/importExport.ts`; static layers loaded by `lib/gisLoader.ts`.
- **Telemetry**: `lib/telemetry.ts` + `useTelemetry` — states live/demo/none, freshness fresh/stale/unknown.
- **i18n**: `src/i18n/translations.ts` (ar/fr/en, parity-tested); direction via `lib/documentSettings.ts`.
- **Optional Supabase**: GIS cache and audit-log writes only.
- **Roles**: admin and others get per-page permissions; `wali` (executive) has `exec-dashboard` plus read access to gis/analytics/statistics/reports/documents and EPWG pages.
