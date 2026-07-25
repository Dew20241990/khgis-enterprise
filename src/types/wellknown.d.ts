declare module 'wellknown' {
  export function parse(wkt: string): GeoJSON.Geometry | null;
  export function stringify(geom: GeoJSON.Geometry): string;
}
