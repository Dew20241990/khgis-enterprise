import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // GitHub Pages
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
            '@mantine/notifications',
          ],

          leaflet: [
            'leaflet',
            'react-leaflet',
          ],

          gis: [
            '@turf/turf',
            '@tmcw/togeojson',
            'wellknown',
          ],

          charts: [
            'recharts',
            'apexcharts',
            'react-apexcharts',
          ],
        },
      },
    },
  },
});