import { TileLayer } from 'react-leaflet';
import { resolveBasemap } from '@/lib/basemaps';

/** Leaflet tile layer for a known base map, always carrying its required attribution. Unknown ids fall back to OSM. */
export function BasemapTileLayer({ id }: { id: string }) {
  const { id: resolved, source: src } = resolveBasemap(id);
  return (
    <TileLayer
      key={resolved}
      url={src.url}
      attribution={src.attribution}
      maxZoom={src.maxZoom}
      subdomains={src.subdomains ?? 'abc'}
    />
  );
}
