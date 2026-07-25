/*
# Create gis_layers table for caching converted GeoJSON

1. New Tables
- `gis_layers`
  - `id` (text, primary key — the layer name, e.g. "Schools")
  - `source_file` (text — original filename, e.g. "Schools.kml")
  - `source_format` (text — original format: kml, kmz, geojson, gpx, wkt)
  - `geojson` (jsonb — the converted GeoJSON FeatureCollection)
  - `feature_count` (integer — number of features in the layer)
  - `loaded_at` (timestamptz — when the layer was last loaded/cached)
  - `checksum` (text — content hash for change detection)

2. Security
- Enable RLS on `gis_layers`.
- Allow anon + authenticated full CRUD — this is a single-tenant public GIS platform with no sign-in screen.
  The data is intentionally public: all GIS layers are community/administrative data for the Wilaya of Khenchela.

3. Notes
- This table acts as a client-side cache for converted GIS data.
- The frontend converts KML/KMZ/GPX/WKT to GeoJSON at startup and caches the result here.
- On subsequent loads, the frontend checks the checksum and only re-converts if the source file changed.
- The `geojson` column stores the full FeatureCollection as JSONB for efficient retrieval.
*/

CREATE TABLE IF NOT EXISTS gis_layers (
  id text PRIMARY KEY,
  source_file text NOT NULL,
  source_format text NOT NULL,
  geojson jsonb NOT NULL,
  feature_count integer NOT NULL DEFAULT 0,
  loaded_at timestamptz NOT NULL DEFAULT now(),
  checksum text
);

ALTER TABLE gis_layers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_gis_layers" ON gis_layers;
CREATE POLICY "anon_select_gis_layers" ON gis_layers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_gis_layers" ON gis_layers;
CREATE POLICY "anon_insert_gis_layers" ON gis_layers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_gis_layers" ON gis_layers;
CREATE POLICY "anon_update_gis_layers" ON gis_layers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_gis_layers" ON gis_layers;
CREATE POLICY "anon_delete_gis_layers" ON gis_layers FOR DELETE
  TO anon, authenticated USING (true);
