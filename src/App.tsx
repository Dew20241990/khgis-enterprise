import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/shell/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { OperationalDashboardPage } from '@/pages/OperationalDashboardPage';
import { AccessDeniedPage } from '@/pages/AccessDeniedPage';
import { GisPage } from '@/pages/GisPage';
import { MunicipalitiesPage } from '@/pages/MunicipalitiesPage';
import { NeighborhoodsPage } from '@/pages/NeighborhoodsPage';
import { BlackSpotsPage } from '@/pages/BlackSpotsPage';
import { BlackSpotDetailsPage } from '@/pages/BlackSpotDetailsPage';
import { IllegalDumpingPage } from '@/pages/IllegalDumpingPage';
import { ContainersPage } from '@/pages/ContainersPage';
import { ShopsPage } from '@/pages/ShopsPage';
import { InspectionsPage } from '@/pages/InspectionsPage';
import { RoutesPage } from '@/pages/RoutesPage';
import { WorkOrdersPage } from '@/pages/WorkOrdersPage';
import { VehiclesPage } from '@/pages/VehiclesPage';
import { DriversPage } from '@/pages/DriversPage';
import { TruckTrackingPage } from '@/pages/TruckTrackingPage';
import { CetCentersPage } from '@/pages/CetCentersPage';
import { EpwgDashboardPage } from '@/pages/epwg/EpwgDashboardPage';
import { EpwgFacilitiesPage } from '@/pages/epwg/EpwgFacilitiesPage';
import { EpwgGisPage } from '@/pages/epwg/EpwgGisPage';
import { EpwgServiceAreasPage } from '@/pages/epwg/EpwgServiceAreasPage';
import { EpwgWorkOrdersPage } from '@/pages/epwg/EpwgWorkOrdersPage';
import { EpwgCollectionPage } from '@/pages/epwg/EpwgCollectionPage';
import { EpwgSortingPage } from '@/pages/epwg/EpwgSortingPage';
import { EpwgEquipmentPage } from '@/pages/epwg/EpwgEquipmentPage';
import { EpwgVehiclesPage } from '@/pages/epwg/EpwgVehiclesPage';
import { EpwgEnvironmentPage } from '@/pages/epwg/EpwgEnvironmentPage';
import { EpwgReportsPage } from '@/pages/epwg/EpwgReportsPage';
import { EpwgDocumentsPage } from '@/pages/epwg/EpwgDocumentsPage';
import { ContractorsPage } from '@/pages/ContractorsPage';
import { ComplaintsPage } from '@/pages/ComplaintsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { StatisticsPage } from '@/pages/StatisticsPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { UsersPage } from '@/pages/UsersPage';
import { RolesPage } from '@/pages/RolesPage';
import { PermissionsPage } from '@/pages/PermissionsPage';
import { AuditLogsPage } from '@/pages/AuditLogsPage';
import { AiAssistantPage } from '@/pages/AiAssistantPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useApp } from '@/store/appStore';
import type { Permission } from '@/lib/auth';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 60000 } },
});

function GisLoadingScreen() {
  const { t } = useApp();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ink-50 dark:bg-ink-950 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center shadow-gov animate-pulse-soft">
        <ShieldCheck className="w-8 h-8 text-white" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{t('appName')}</p>
        <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">{t('appSubtitle')}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>تحميل الطبقات الجغرافية... Loading GIS layers</span>
      </div>
    </div>
  );
}

const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/': 'dashboard',
  '/gis': 'gis',
  '/municipalities': 'municipalities',
  '/neighborhoods': 'neighborhoods',
  '/black-spots': 'black-spots',
  '/illegal-dumping': 'illegal-dumping',
  '/containers': 'containers',
  '/shops': 'shops',
  '/inspections': 'inspections',
  '/routes': 'routes',
  '/work-orders': 'work-orders',
  '/vehicles': 'vehicles',
  '/drivers': 'drivers',
  '/truck-tracking': 'truck-tracking',
  '/cet-centers': 'cet-centers',
  '/contractors': 'contractors',
  '/complaints': 'complaints',
  '/reports': 'reports',
  '/analytics': 'analytics',
  '/statistics': 'statistics',
  '/documents': 'documents',
  '/users': 'users',
  '/roles': 'roles',
  '/permissions': 'permissions',
  '/audit-logs': 'audit-logs',
  '/ai-assistant': 'ai-assistant',
  '/settings': 'settings',
  // Executive routes (Wali-exclusive)
  '/exec': 'exec-dashboard',
  '/exec/gis': 'exec-gis',
  '/exec/analytics': 'exec-analytics',
  '/exec/reports': 'exec-reports',
  '/exec/statistics': 'exec-statistics',
  '/exec/rankings': 'exec-rankings',
  '/exec/decisions': 'exec-decisions',
  '/exec/alerts': 'exec-alerts',
  // EPWG routes
  '/epwg': 'epwg',
  '/epwg/facilities': 'epwg-facilities',
  '/epwg/gis': 'epwg-gis',
  '/epwg/service-areas': 'epwg-service-areas',
  '/epwg/work-orders': 'epwg-work-orders',
  '/epwg/collection': 'epwg-collection',
  '/epwg/sorting': 'epwg-sorting',
  '/epwg/equipment': 'epwg-equipment',
  '/epwg/vehicles': 'epwg-vehicles',
  '/epwg/environment': 'epwg-environment',
  '/epwg/reports': 'epwg-reports',
  '/epwg/documents': 'epwg-documents',
};

function ProtectedRoute({ path, children }: { path: string; children: React.ReactNode }) {
  const { isAuthenticated, hasPermission, user } = useApp();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const required = ROUTE_PERMISSIONS[path];
  if (required) {
    const allowed = path === '/'
      ? (hasPermission('dashboard') || hasPermission('exec-dashboard'))
      : hasPermission(required);
    if (!allowed) return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

function App({ gisReadyPromise }: { gisReadyPromise: Promise<unknown> }) {
  const [gisReady, setGisReady] = useState(false);
  const { isAuthenticated, checkInactivity, touchActivity, hasPermission } = useApp();

  useEffect(() => {
    gisReadyPromise.then(() => setGisReady(true)).catch(() => setGisReady(true));
  }, [gisReadyPromise]);

  // Inactivity auto-logout
  useEffect(() => {
    const interval = setInterval(() => checkInactivity(), 60000);
    const handler = () => touchActivity();
    window.addEventListener('mousemove', handler);
    window.addEventListener('keydown', handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handler);
      window.removeEventListener('keydown', handler);
    };
  }, [checkInactivity, touchActivity]);

  if (!gisReady) return <GisLoadingScreen />;

  // The root dashboard renders the Executive Dashboard for the Wali,
  // and the Operational Dashboard for all other roles.
  const RootDashboard = hasPermission('exec-dashboard') ? <DashboardPage /> : <OperationalDashboardPage />;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/403" element={isAuthenticated ? <AccessDeniedPage /> : <Navigate to="/login" replace />} />
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<ProtectedRoute path="/">{RootDashboard}</ProtectedRoute>} />
                    <Route path="/gis" element={<ProtectedRoute path="/gis"><GisPage /></ProtectedRoute>} />
                    <Route path="/municipalities" element={<ProtectedRoute path="/municipalities"><MunicipalitiesPage /></ProtectedRoute>} />
                    <Route path="/neighborhoods" element={<ProtectedRoute path="/neighborhoods"><NeighborhoodsPage /></ProtectedRoute>} />
                    <Route path="/black-spots" element={<ProtectedRoute path="/black-spots"><BlackSpotsPage /></ProtectedRoute>} />
                    <Route path="/black-spots/:id" element={<ProtectedRoute path="/black-spots"><BlackSpotDetailsPage /></ProtectedRoute>} />
                    <Route path="/illegal-dumping" element={<ProtectedRoute path="/illegal-dumping"><IllegalDumpingPage /></ProtectedRoute>} />
                    <Route path="/containers" element={<ProtectedRoute path="/containers"><ContainersPage /></ProtectedRoute>} />
                    <Route path="/shops" element={<ProtectedRoute path="/shops"><ShopsPage /></ProtectedRoute>} />
                    <Route path="/inspections" element={<ProtectedRoute path="/inspections"><InspectionsPage /></ProtectedRoute>} />
                    <Route path="/routes" element={<ProtectedRoute path="/routes"><RoutesPage /></ProtectedRoute>} />
                    <Route path="/work-orders" element={<ProtectedRoute path="/work-orders"><WorkOrdersPage /></ProtectedRoute>} />
                    <Route path="/vehicles" element={<ProtectedRoute path="/vehicles"><VehiclesPage /></ProtectedRoute>} />
                    <Route path="/drivers" element={<ProtectedRoute path="/drivers"><DriversPage /></ProtectedRoute>} />
                    <Route path="/truck-tracking" element={<ProtectedRoute path="/truck-tracking"><TruckTrackingPage /></ProtectedRoute>} />
                    <Route path="/cet-centers" element={<ProtectedRoute path="/cet-centers"><CetCentersPage /></ProtectedRoute>} />
                    {/* EPWG — Public Wilaya Establishment for Technical Landfill Centers */}
                    <Route path="/epwg" element={<ProtectedRoute path="/epwg"><EpwgDashboardPage /></ProtectedRoute>} />
                    <Route path="/epwg/facilities" element={<ProtectedRoute path="/epwg/facilities"><EpwgFacilitiesPage /></ProtectedRoute>} />
                    <Route path="/epwg/gis" element={<ProtectedRoute path="/epwg/gis"><EpwgGisPage /></ProtectedRoute>} />
                    <Route path="/epwg/service-areas" element={<ProtectedRoute path="/epwg/service-areas"><EpwgServiceAreasPage /></ProtectedRoute>} />
                    <Route path="/epwg/work-orders" element={<ProtectedRoute path="/epwg/work-orders"><EpwgWorkOrdersPage /></ProtectedRoute>} />
                    <Route path="/epwg/collection" element={<ProtectedRoute path="/epwg/collection"><EpwgCollectionPage /></ProtectedRoute>} />
                    <Route path="/epwg/sorting" element={<ProtectedRoute path="/epwg/sorting"><EpwgSortingPage /></ProtectedRoute>} />
                    <Route path="/epwg/equipment" element={<ProtectedRoute path="/epwg/equipment"><EpwgEquipmentPage /></ProtectedRoute>} />
                    <Route path="/epwg/vehicles" element={<ProtectedRoute path="/epwg/vehicles"><EpwgVehiclesPage /></ProtectedRoute>} />
                    <Route path="/epwg/environment" element={<ProtectedRoute path="/epwg/environment"><EpwgEnvironmentPage /></ProtectedRoute>} />
                    <Route path="/epwg/reports" element={<ProtectedRoute path="/epwg/reports"><EpwgReportsPage /></ProtectedRoute>} />
                    <Route path="/epwg/documents" element={<ProtectedRoute path="/epwg/documents"><EpwgDocumentsPage /></ProtectedRoute>} />
                    <Route path="/contractors" element={<ProtectedRoute path="/contractors"><ContractorsPage /></ProtectedRoute>} />
                    <Route path="/complaints" element={<ProtectedRoute path="/complaints"><ComplaintsPage /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute path="/reports"><ReportsPage /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute path="/analytics"><AnalyticsPage /></ProtectedRoute>} />
                    <Route path="/statistics" element={<ProtectedRoute path="/statistics"><StatisticsPage /></ProtectedRoute>} />
                    <Route path="/documents" element={<ProtectedRoute path="/documents"><DocumentsPage /></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute path="/users"><UsersPage /></ProtectedRoute>} />
                    <Route path="/roles" element={<ProtectedRoute path="/roles"><RolesPage /></ProtectedRoute>} />
                    <Route path="/permissions" element={<ProtectedRoute path="/permissions"><PermissionsPage /></ProtectedRoute>} />
                    <Route path="/audit-logs" element={<ProtectedRoute path="/audit-logs"><AuditLogsPage /></ProtectedRoute>} />
                    <Route path="/ai-assistant" element={<ProtectedRoute path="/ai-assistant"><AiAssistantPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute path="/settings"><SettingsPage /></ProtectedRoute>} />
                    {/* Executive routes (Wali-exclusive) */}
                    <Route path="/exec" element={<ProtectedRoute path="/exec"><DashboardPage /></ProtectedRoute>} />
                    <Route path="/exec/gis" element={<ProtectedRoute path="/exec/gis"><GisPage /></ProtectedRoute>} />
                    <Route path="/exec/analytics" element={<ProtectedRoute path="/exec/analytics"><AnalyticsPage /></ProtectedRoute>} />
                    <Route path="/exec/reports" element={<ProtectedRoute path="/exec/reports"><ReportsPage /></ProtectedRoute>} />
                    <Route path="/exec/statistics" element={<ProtectedRoute path="/exec/statistics"><StatisticsPage /></ProtectedRoute>} />
                    <Route path="/exec/rankings" element={<ProtectedRoute path="/exec/rankings"><StatisticsPage /></ProtectedRoute>} />
                    <Route path="/exec/decisions" element={<ProtectedRoute path="/exec/decisions"><DashboardPage /></ProtectedRoute>} />
                    <Route path="/exec/alerts" element={<ProtectedRoute path="/exec/alerts"><DashboardPage /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
