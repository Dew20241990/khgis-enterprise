/**
 * Base-map tile sources with the attribution their licences require.
 *
 * Licensing notes (verify before production use):
 * - OpenStreetMap standard tiles are subject to the OSM Tile Usage Policy (no heavy/bulk use);
 *   attribution to "OpenStreetMap contributors" is mandatory.
 * - CARTO basemaps and Esri World Imagery have their own terms of service and usage limits.
 * - Google tile URLs (mt*.google.com) must NOT be used outside Google's own Maps APIs, so they are
 *   intentionally not offered here.
 */

export type BasemapId = 'osm' | 'esri_sat' | 'carto_light' | 'carto_dark' | 'terrain';

export interface BasemapSource {
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
}

const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const BASEMAPS: Record<BasemapId, BasemapSource> = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: OSM_ATTR,
    maxZoom: 19,
  },
  esri_sat: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    maxZoom: 19,
  },
  carto_light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: `${OSM_ATTR} &copy; <a href="https://carto.com/attributions">CARTO</a>`,
    maxZoom: 20,
    subdomains: ['a', 'b', 'c', 'd'],
  },
  carto_dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: `${OSM_ATTR} &copy; <a href="https://carto.com/attributions">CARTO</a>`,
    maxZoom: 20,
    subdomains: ['a', 'b', 'c', 'd'],
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 17,
    subdomains: ['a', 'b', 'c'],
  },
};

/** Maps the simple layer names used by dashboard map toggles to base-map ids. */
export type SimpleLayer = 'street' | 'satellite' | 'dark' | 'terrain';
export const SIMPLE_LAYER_TO_BASEMAP: Record<SimpleLayer, BasemapId> = {
  street: 'osm',
  satellite: 'esri_sat',
  dark: 'carto_dark',
  terrain: 'terrain',
};
