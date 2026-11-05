# Architecture

- **UI**: React 18, Tailwind, Lucide, Framer Motion; routes in `src/App.tsx` guarded by `ProtectedRoute` + a path→permission map.
- **State**: zustand store `src/store/appStore.ts` (persist v2: locale, theme, sidebar, username only; user rebuilt via `findSessionUser`).
- **CRUD framework**: `components/ui/CrudManager`, `SmartForm`, `EnterpriseDataTable`; helpers in `lib/formValues.ts`, `lib/csv.ts`.
- **GIS**: Leaflet/react-leaflet; basemaps + attribution in `lib/basemaps.ts`; spatial ops (Turf v7) in `lib/spatialEngine.ts`; validation in `lib/geometry.ts`; import/export in `lib/importExport.ts`; static layers loaded by `lib/gisLoader.ts`.
- **Telemetry**: `lib/telemetry.ts` + `useTelemetry` — states live/demo/none, freshness fresh/stale/unknown.
- **i18n**: typed dictionaries — `defineModule({ ar, fr, en })` (`src/i18n/define.ts`, compile-time key parity), modules in `src/i18n/modules/` registered in `modules/index.ts`, legacy keys in `src/i18n/translations.ts`; `t()` from the store; direction via `lib/documentSettings.ts`. A ratchet (`scripts/i18nScan.ts`, baseline `src/i18n/hardcoded-text.baseline.json`) keeps hard-coded UI text from growing; see `docs/I18N.md`.
- **Local assistant (no AI model)**: `lib/assistantEngine.ts` runs four fixed analyses over the demo datasets, `lib/assistantView.ts` turns an answer into translated cards/table, `i18n/assistantVocab.ts` holds the ar/fr/en question keywords; page `pages/AiAssistantPage.tsx`. Nothing leaves the browser.
- **Integration status**: `lib/integrations.ts` (`isSupabaseConfigured`, `isTelemetryConfigured`) reports whether the environment variables are present — not whether the service is reachable. Used by `pages/SettingsPage.tsx`.
- **Observation locations**: `lib/observationLocation.ts` validates typed coordinates, or falls back to the municipality centre and flags the record as approximate (`locationSource`).
- **Optional Supabase**: GIS cache and audit-log writes only.
- **Roles**: admin and others get per-page permissions; `wali` (executive) has `exec-dashboard` plus read access to gis/analytics/statistics/reports/documents and EPWG pages.
