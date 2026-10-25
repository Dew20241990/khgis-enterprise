import { TileLayer } from 'react-leaflet';
import { BASEMAPS, type BasemapId } from '@/lib/basemaps';

/** Leaflet tile layer for a known base map, always carrying its required attribution. */
export function BasemapTileLayer({ id }: { id: BasemapId }) {
  const src = BASEMAPS[id];
  return (
    <TileLayer
      key={id}
      url={src.url}
      attribution={src.attribution}
      maxZoom={src.maxZoom}
      subdomains={src.subdomains ?? 'abc'}
    />
  );
}
