import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    base: '/khgis-enterprise/',
  plugins: [react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    host: true,
    port: 5173,
    open: true,
  },

  preview: {
    host: true,
    port: 4173,
  },

  optimizeDeps: {
    include: [
      '@turf/turf',
      '@tmcw/togeojson',
      'wellknown',
      'leaflet',
      'react-leaflet',
      'leaflet-draw',
      'leaflet.markercluster',
      'proj4',
      'papaparse',
      'xlsx',
      'jspdf',
      'jspdf-autotable',
      'file-saver',
      'lucide-react',
    ],
  },

  assetsInclude: [
    '**/*.geojson',
    '**/*.json',
    '**/*.kml',
    '**/*.kmz',
    '**/*.gpx',
    '**/*.wkt',
    '**/*.csv',
    '**/*.xlsx',
    '**/*.pdf',
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.svg',
    '**/*.webp',
  ],

  build: {
    target: 'esnext',
    sourcemap: false,
    minify: 'esbuild',

    chunkSizeWarningLimit: 1500,

    rollupOptions: {
      output: {
        manualChunks: {
          react: [
            'react',
            'react-dom',
            'react-router-dom',
          ],

          mantine: [
            '@mantine/core',
            '@mantine/hooks',
            '@mantine/dates',
          ],

          leaflet: [
            'leaflet',
            'react-leaflet',
            'leaflet-draw',
            'leaflet.markercluster',
          ],

          gis: [
            '@turf/turf',
            '@tmcw/togeojson',
            'wellknown',
            'proj4',
          ],

          charts: [
            'recharts',
            'apexcharts',
            'react-apexcharts',
          ],

          export: [
            'xlsx',
            'papaparse',
            'jspdf',
            'jspdf-autotable',
            'file-saver',
          ],
        },
      },
    },
  },
});