import { describe, expect, it } from 'vitest';
import { escapeXml, parseCSV, parseFile, parseGeoJSON, parseJSON, parseKML } from './importExport';

describe('parseCSV', () => {
  it('parses rows keyed by header', () => {
    const r = parseCSV('id,name\n1,Khenchela\n2,Kais');
    expect(r.rows).toEqual([{ id: '1', name: 'Khenchela' }, { id: '2', name: 'Kais' }]);
    expect(r.validRows).toBe(2);
    expect(r.errors).toEqual([]);
  });

  it('copes with CRLF and quoted newlines', () => {
    const r = parseCSV('id,note\r\n1,"a\nb"\r\n');
    expect(r.rows).toEqual([{ id: '1', note: 'a\nb' }]);
  });

  it('reports rows with the wrong column count', () => {
    const r = parseCSV('a,b\n1,2\n3\n4,5');
    expect(r.validRows).toBe(2);
    expect(r.totalRows).toBe(3);
    expect(r.errors).toEqual([{ row: 2, message: 'Expected 2 columns, got 1' }]);
  });

  it('fails clearly on header-only or malformed input', () => {
    expect(parseCSV('a,b').errors[0].message).toMatch(/header row/);
    expect(parseCSV('a,b\n"x,1').errors[0].message).toMatch(/Invalid CSV/);
  });
});

describe('parseJSON', () => {
  it('accepts an array of objects or a single object', () => {
    expect(parseJSON('[{"a":1},{"a":2}]').validRows).toBe(2);
    expect(parseJSON('{"a":1}').rows).toEqual([{ a: 1 }]);
  });

  it('flags non-object items and invalid JSON', () => {
    const r = parseJSON('[{"a":1}, 5, null]');
    expect(r.validRows).toBe(1);
    expect(r.errors).toHaveLength(2);
    expect(parseJSON('{oops').errors[0].message).toMatch(/Invalid JSON/);
  });
});

describe('parseGeoJSON', () => {
  const fc = (features: unknown[], extra: object = {}) => JSON.stringify({ type: 'FeatureCollection', features, ...extra });
  const point = (coordinates: unknown, props: object = {}) => ({ type: 'Feature', properties: props, geometry: { type: 'Point', coordinates } });

  it('maps properties and geometry into rows', () => {
    const r = parseGeoJSON(fc([point([7.14, 35.42], { name: 'Bin 1' })]));
    expect(r.rows).toEqual([{ name: 'Bin 1', _geometry: { type: 'Point', coordinates: [7.14, 35.42] }, _geometryType: 'Point' }]);
  });

  it('drops invalid geometries and reports them 1-based', () => {
    const r = parseGeoJSON(fc([point([7.1, 35.4]), point([545000, 3925000]), point([7.2, 35.5])]));
    expect(r.validRows).toBe(2);
    expect(r.totalRows).toBe(3);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].row).toBe(2);
    expect(r.errors[0].message).toMatch(/projected CRS/);
  });

  it('rejects a projected CRS declaration outright', () => {
    const r = parseGeoJSON(fc([point([7, 35])], { crs: { type: 'name', properties: { name: 'EPSG:32632' } } }));
    expect(r.validRows).toBe(0);
    expect(r.errors[0].message).toMatch(/unsupported CRS/);
  });

  it('rejects non-collections and bad JSON', () => {
    expect(parseGeoJSON('{"type":"Polygon"}').errors[0].message).toMatch(/FeatureCollection/);
    expect(parseGeoJSON('nope').errors[0].message).toMatch(/Invalid GeoJSON/);
  });
});

describe('parseKML', () => {
  const kmlDoc = (body: string) => `<?xml version="1.0"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document>${body}</Document></kml>`;

  it('imports placemarks as rows with geometry', () => {
    const r = parseKML(kmlDoc('<Placemark><name>School</name><Point><coordinates>7.14,35.42,0</coordinates></Point></Placemark>'));
    expect(r.validRows).toBe(1);
    expect(r.rows[0]).toMatchObject({ name: 'School', _geometryType: 'Point' });
  });

  it('reports malformed XML', () => {
    expect(parseKML('<kml><Document><Placemark></kml>').errors[0].message).toMatch(/not well-formed/);
  });
});

describe('parseFile / escapeXml', () => {
  it('dispatches by format and rejects unknown formats', () => {
    expect(parseFile('[{"a":1}]', 'JSON').validRows).toBe(1);
    expect(parseFile('x', 'shp').errors[0].message).toMatch(/Unsupported format/);
  });

  it('escapes XML special characters', () => {
    expect(escapeXml(`<a href="x">Tom & 'Jerry'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;Tom &amp; &apos;Jerry&apos;&lt;/a&gt;');
  });
});
