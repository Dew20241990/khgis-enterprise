// Generates GeoJSON files from mockData for /assets/gis/
// Run: npx tsx scripts/gen-geojson.ts
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  municipalities, neighborhoods, blackSpots, containers, shops,
  vehicles, cetCenters, illegalDumps, routes, inspections,
  KHENCHELA_CENTER,
} from '../src/data/mockData';

const OUT = join(process.cwd(), 'assets', 'gis');
mkdirSync(OUT, { recursive: true });

function point(lat: number, lng: number, props: Record<string, any>): GeoJSON.Feature {
  return { type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: { ...props, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: props.status || 'active', attachments: [], history: [] } };
}

function polygon(coords: [number, number][], props: Record<string, any>): GeoJSON.Feature {
  const ring = coords.map(([lat, lng]) => [lng, lat]);
  ring.push(ring[0]);
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] }, properties: { ...props, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: props.status || 'active', attachments: [], history: [] } };
}

function lineString(coords: [number, number][], props: Record<string, any>): GeoJSON.Feature {
  return { type: 'Feature', geometry: { type: 'LineString', coordinates: coords.map(([lat, lng]) => [lng, lat]) }, properties: { ...props, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: props.status || 'active', attachments: [], history: [] } };
}

function fc(features: GeoJSON.Feature[]): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features };
}

function write(name: string, data: any) {
  writeFileSync(join(OUT, name), JSON.stringify(data, null, 2));
  console.log(`  ${name}: ${data.features?.length || 0} features`);
}

// 1. Neighborhoods
write('Neighborhoods.geojson', fc(neighborhoods.map(n =>
  polygon(
    [
      [n.lat - 0.004, n.lng - 0.004],
      [n.lat - 0.004, n.lng + 0.004],
      [n.lat + 0.004, n.lng + 0.004],
      [n.lat + 0.004, n.lng - 0.004],
    ],
    { uuid: n.id, name: n.nameAr, municipality: n.municipality, zone: 'Zone A', neighborhood: n.nameAr, population: n.population, containers: n.containers, openSpots: n.openSpots, fillRate: n.fillRate, createdBy: 'system' }
  )
)));

// 2. Operational Zones (4 zones for Khenchela commune)
const zones = [
  { id: 'Z-01', name: 'المنطقة الشمالية', nameFr: 'Zone Nord', center: [35.44, 7.14] as [number, number] },
  { id: 'Z-02', name: 'المنطقة الجنوبية', nameFr: 'Zone Sud', center: [35.40, 7.14] as [number, number] },
  { id: 'Z-03', name: 'المنطقة الشرقية', nameFr: 'Zone Est', center: [35.42, 7.17] as [number, number] },
  { id: 'Z-04', name: 'المنطقة الغربية', nameFr: 'Zone Ouest', center: [35.42, 7.11] as [number, number] },
];
write('Zones.geojson', fc(zones.map(z =>
  polygon(
    [
      [z.center[0] - 0.012, z.center[1] - 0.012],
      [z.center[0] - 0.012, z.center[1] + 0.012],
      [z.center[0] + 0.012, z.center[1] + 0.012],
      [z.center[0] + 0.012, z.center[1] - 0.012],
    ],
    { uuid: z.id, name: z.name, nameFr: z.nameFr, municipality: 'خنشلا', zone: z.name, neighborhood: '', createdBy: 'system' }
  )
)));

// 3. Containers
write('Containers.geojson', fc(containers.map(c =>
  point(c.lat, c.lng, {
    uuid: c.id, code: c.code, municipality: c.municipality, zone: 'Zone A', neighborhood: '',
    type: c.type, capacity: c.capacity, fillLevel: c.fillLevel, status: c.status,
    lastEmptied: c.lastEmptied, createdBy: 'system',
  })
)));

// 4. Black Spots
write('BlackSpots.geojson', fc(blackSpots.map(s =>
  point(s.lat, s.lng, {
    uuid: s.id, code: s.code, title: s.titleAr, municipality: s.municipality,
    zone: 'Zone A', neighborhood: s.neighborhood, street: s.street, address: s.address,
    status: s.status, priority: s.priority, category: s.category, riskLevel: s.riskLevel,
    reportedAt: s.reportedAt, responsible: s.responsible, inspections: s.inspections,
    description: s.description, createdBy: 'system',
  })
)));

// 5. Commercial Shops
write('Commercial.geojson', fc(shops.map(s =>
  point(s.lat, s.lng, {
    uuid: s.id, name: s.name, municipality: s.municipality, zone: 'Zone A', neighborhood: '',
    category: s.category, contractStatus: s.contractStatus, feePaid: s.feePaid,
    containers: s.containers, inspections: s.inspections, lastInspection: s.lastInspection,
    createdBy: 'system',
  })
)));

// 6. Inspection Routes (as LineStrings)
write('Inspection.geojson', fc(routes.slice(0, 12).map((r, i) => {
  const m = municipalities[i % municipalities.length];
  const pts: [number, number][] = Array.from({ length: 5 }, (_, j) => [
    m.center[0] + (Math.random() - 0.5) * 0.02,
    m.center[1] + (Math.random() - 0.5) * 0.02,
  ] as [number, number]);
  return lineString(pts, {
    uuid: r.id, code: r.code, name: r.name, municipality: r.municipality,
    zone: 'Zone A', neighborhood: '', vehicle: r.vehicle, driver: r.driver,
    stops: r.stops, distanceKm: r.distanceKm, status: r.status, progress: r.progress,
    createdBy: 'system',
  });
})));

// 7. Illegal Dumping Sites
write('IllegalDumping.geojson', fc(illegalDumps.map(d =>
  point(d.lat, d.lng, {
    uuid: d.id, code: d.code, municipality: d.municipality, zone: 'Zone A', neighborhood: '',
    location: d.location, volume: d.volume, type: d.type, status: d.status,
    reportedAt: d.reportedAt, createdBy: 'system',
  })
)));

// 8. Vehicles (current positions)
write('Vehicles.geojson', fc(vehicles.map(v =>
  point(v.lat, v.lng, {
    uuid: v.id, plate: v.plate, type: v.type, capacity: v.capacity, status: v.status,
    driver: v.driver, municipality: v.municipality, zone: 'Zone A', neighborhood: '',
    fuel: v.fuel, mileage: v.mileage, createdBy: 'system',
  })
)));

// 9. CET Centers
write('CETCenters.geojson', fc(cetCenters.map(c =>
  point(c.lat, c.lng, {
    uuid: c.id, name: c.name, city: c.city, capacityTpd: c.capacityTpd,
    currentLoadTpd: c.currentLoadTpd, status: c.status, manager: c.manager,
    municipality: c.city, zone: 'Zone A', neighborhood: '', createdBy: 'system',
  })
)));

// 10. Buildings (footprints around Khenchela center)
const buildings = Array.from({ length: 40 }, (_, i) => {
  const lat = KHENCHELA_CENTER[0] + (Math.random() - 0.5) * 0.03;
  const lng = KHENCHELA_CENTER[1] + (Math.random() - 0.5) * 0.03;
  const s = 0.0008;
  return polygon(
    [[lat - s, lng - s], [lat - s, lng + s], [lat + s, lng + s], [lat + s, lng - s]],
    { uuid: `BLD-${i + 1}`, type: i % 3 === 0 ? 'residential' : i % 3 === 1 ? 'commercial' : 'public', municipality: 'خنشلا', zone: 'Zone A', neighborhood: '', createdBy: 'system' }
  );
});
write('Buildings.geojson', fc(buildings));

// 11. Public Parks
const parks = [
  { name: 'الحديقة العمومية', lat: 35.425, lng: 7.142 },
  { name: 'منتزه الترفيه', lat: 35.430, lng: 7.150 },
  { name: 'الغابة البلدية', lat: 35.415, lng: 7.135 },
];
write('Parks.geojson', fc(parks.map((p, i) =>
  polygon(
    [
      [p.lat - 0.003, p.lng - 0.003],
      [p.lat - 0.003, p.lng + 0.003],
      [p.lat + 0.003, p.lng + 0.003],
      [p.lat + 0.003, p.lng - 0.003],
    ],
    { uuid: `PRK-${i + 1}`, name: p.name, municipality: 'خنشلا', zone: 'Zone A', neighborhood: '', type: 'park', createdBy: 'system' }
  )
)));

// 12. Industrial Zones
const industrial = [
  { name: 'المنطقة الصناعية خنشلة', lat: 35.435, lng: 7.155 },
  { name: 'المنطقة الصناعية قايس', lat: 35.445, lng: 7.220 },
];
write('IndustrialZones.geojson', fc(industrial.map((z, i) =>
  polygon(
    [
      [z.lat - 0.005, z.lng - 0.005],
      [z.lat - 0.005, z.lng + 0.005],
      [z.lat + 0.005, z.lng + 0.005],
      [z.lat + 0.005, z.lng - 0.005],
    ],
    { uuid: `IND-${i + 1}`, name: z.name, municipality: 'خنشلا', zone: 'Zone A', neighborhood: '', type: 'industrial', createdBy: 'system' }
  )
)));

console.log('\nAll GeoJSON files generated in assets/gis/');
