import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadAllGisLayers } from './lib/gisLoader';

// Load and convert all GIS layers (KML → GeoJSON) at startup.
// The promise is stored so App can show a loading state until ready.
// Safety timeout ensures the app always loads even if GIS loading hangs.
const gisReady = Promise.race([
  loadAllGisLayers().catch(() => {}),
  new Promise((resolve) => setTimeout(resolve, 8000)),
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App gisReadyPromise={gisReady} />
  </StrictMode>
);
