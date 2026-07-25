import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, Building2, Home, AlertTriangle, Trash2, Store,
  ClipboardCheck, Sparkles, Wrench, Truck, UserSquare2, Navigation,
  Factory, Briefcase, MessageSquareWarning, FileBarChart, BarChart3,
  PieChart, FolderArchive, Users, Shield, KeyRound, ScrollText,
  Settings, ChevronLeft, ShieldCheck, Crown, Brain, Target, Trophy, Gauge, Activity,
  Recycle, Leaf, Layers, Boxes,
} from 'lucide-react';
import { useApp } from '@/store/appStore';
import { cn } from '@/lib/cn';

interface NavItem { to: string; key: string; icon: React.ReactNode; end?: boolean; perm: string }
interface NavGroup { labelKey: string; items: NavItem[] }

const groups: NavGroup[] = [
  {
    labelKey: 'execCenter',
    items: [
      { to: '/exec', key: 'execDashboard', icon: <Crown className="w-[18px] h-[18px]" />, end: true, perm: 'exec-dashboard' },
      { to: '/exec/gis', key: 'execGis', icon: <Map className="w-[18px] h-[18px]" />, perm: 'exec-gis' },
      { to: '/exec/analytics', key: 'execAnalytics', icon: <BarChart3 className="w-[18px] h-[18px]" />, perm: 'exec-analytics' },
      { to: '/exec/rankings', key: 'execRankings', icon: <Trophy className="w-[18px] h-[18px]" />, perm: 'exec-rankings' },
      { to: '/exec/decisions', key: 'execDecisions', icon: <Brain className="w-[18px] h-[18px]" />, perm: 'exec-decisions' },
      { to: '/exec/alerts', key: 'execAlerts', icon: <Activity className="w-[18px] h-[18px]" />, perm: 'exec-alerts' },
      { to: '/exec/reports', key: 'execReports', icon: <FileBarChart className="w-[18px] h-[18px]" />, perm: 'exec-reports' },
      { to: '/exec/statistics', key: 'execStatistics', icon: <Gauge className="w-[18px] h-[18px]" />, perm: 'exec-statistics' },
    ],
  },
  {
    labelKey: 'overview',
    items: [
      { to: '/', key: 'dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" />, end: true, perm: 'dashboard' },
      { to: '/gis', key: 'gisMap', icon: <Map className="w-[18px] h-[18px]" />, perm: 'gis' },
    ],
  },
  {
    labelKey: 'fieldOps',
    items: [
      { to: '/municipalities', key: 'municipalities', icon: <Building2 className="w-[18px] h-[18px]" />, perm: 'municipalities' },
      { to: '/neighborhoods', key: 'neighborhoods', icon: <Home className="w-[18px] h-[18px]" />, perm: 'neighborhoods' },
      { to: '/black-spots', key: 'blackSpots', icon: <AlertTriangle className="w-[18px] h-[18px]" />, perm: 'black-spots' },
      { to: '/illegal-dumping', key: 'illegalDumping', icon: <Trash2 className="w-[18px] h-[18px]" />, perm: 'illegal-dumping' },
      { to: '/containers', key: 'wasteContainers', icon: <Trash2 className="w-[18px] h-[18px]" />, perm: 'containers' },
      { to: '/shops', key: 'commercialViolations', icon: <Store className="w-[18px] h-[18px]" />, perm: 'shops' },
      { to: '/inspections', key: 'inspectionTours', icon: <ClipboardCheck className="w-[18px] h-[18px]" />, perm: 'inspections' },
      { to: '/routes', key: 'cleaningOperations', icon: <Sparkles className="w-[18px] h-[18px]" />, perm: 'routes' },
      { to: '/work-orders', key: 'workOrders', icon: <Wrench className="w-[18px] h-[18px]" />, perm: 'work-orders' },
    ],
  },
  {
    labelKey: 'epwgGroup',
    items: [
      { to: '/epwg', key: 'epwgDashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" />, end: true, perm: 'epwg' },
      { to: '/epwg/facilities', key: 'epwgFacilities', icon: <Factory className="w-[18px] h-[18px]" />, perm: 'epwg-facilities' },
      { to: '/epwg/gis', key: 'epwgGis', icon: <Map className="w-[18px] h-[18px]" />, perm: 'epwg-gis' },
      { to: '/epwg/service-areas', key: 'epwgServiceAreas', icon: <Layers className="w-[18px] h-[18px]" />, perm: 'epwg-service-areas' },
      { to: '/epwg/work-orders', key: 'epwgWorkOrders', icon: <Wrench className="w-[18px] h-[18px]" />, perm: 'epwg-work-orders' },
      { to: '/epwg/collection', key: 'epwgCollection', icon: <BarChart3 className="w-[18px] h-[18px]" />, perm: 'epwg-collection' },
      { to: '/epwg/sorting', key: 'epwgSorting', icon: <Recycle className="w-[18px] h-[18px]" />, perm: 'epwg-sorting' },
      { to: '/epwg/equipment', key: 'epwgEquipment', icon: <Wrench className="w-[18px] h-[18px]" />, perm: 'epwg-equipment' },
      { to: '/epwg/vehicles', key: 'epwgVehicles', icon: <Truck className="w-[18px] h-[18px]" />, perm: 'epwg-vehicles' },
      { to: '/epwg/environment', key: 'epwgEnvironment', icon: <Leaf className="w-[18px] h-[18px]" />, perm: 'epwg-environment' },
      { to: '/epwg/reports', key: 'epwgReports', icon: <FileBarChart className="w-[18px] h-[18px]" />, perm: 'epwg-reports' },
      { to: '/epwg/documents', key: 'epwgDocuments', icon: <FolderArchive className="w-[18px] h-[18px]" />, perm: 'epwg-documents' },
    ],
  },
  {
    labelKey: 'resources',
    items: [
      { to: '/vehicles', key: 'vehicles', icon: <Truck className="w-[18px] h-[18px]" />, perm: 'vehicles' },
      { to: '/drivers', key: 'drivers', icon: <UserSquare2 className="w-[18px] h-[18px]" />, perm: 'drivers' },
      { to: '/truck-tracking', key: 'truckTracking', icon: <Navigation className="w-[18px] h-[18px]" />, perm: 'truck-tracking' },
      { to: '/cet-centers', key: 'cetCenters', icon: <Factory className="w-[18px] h-[18px]" />, perm: 'cet-centers' },
      { to: '/contractors', key: 'contractors', icon: <Briefcase className="w-[18px] h-[18px]" />, perm: 'contractors' },
    ],
  },
  {
    labelKey: 'publicServices',
    items: [
      { to: '/complaints', key: 'publicComplaints', icon: <MessageSquareWarning className="w-[18px] h-[18px]" />, perm: 'complaints' },
    ],
  },
  {
    labelKey: 'intelligence',
    items: [
      { to: '/reports', key: 'reports', icon: <FileBarChart className="w-[18px] h-[18px]" />, perm: 'reports' },
      { to: '/analytics', key: 'analytics', icon: <BarChart3 className="w-[18px] h-[18px]" />, perm: 'analytics' },
      { to: '/statistics', key: 'statistics', icon: <PieChart className="w-[18px] h-[18px]" />, perm: 'statistics' },
      { to: '/documents', key: 'documents', icon: <FolderArchive className="w-[18px] h-[18px]" />, perm: 'documents' },
    ],
  },
  {
    labelKey: 'administration',
    items: [
      { to: '/users', key: 'users', icon: <Users className="w-[18px] h-[18px]" />, perm: 'users' },
      { to: '/roles', key: 'roles', icon: <Shield className="w-[18px] h-[18px]" />, perm: 'roles' },
      { to: '/permissions', key: 'permissions', icon: <KeyRound className="w-[18px] h-[18px]" />, perm: 'permissions' },
      { to: '/audit-logs', key: 'auditLogs', icon: <ScrollText className="w-[18px] h-[18px]" />, perm: 'audit-logs' },
    ],
  },
  {
    labelKey: 'system',
    items: [
      { to: '/ai-assistant', key: 'aiAssistant', icon: <Sparkles className="w-[18px] h-[18px]" />, perm: 'ai-assistant' },
      { to: '/settings', key: 'settings', icon: <Settings className="w-[18px] h-[18px]" />, perm: 'settings' },
    ],
  },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, t, hasPermission } = useApp();
  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 76 : 280 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="hidden lg:flex flex-col shrink-0 border-l border-ink-200 dark:border-ink-800 bg-white/80 dark:bg-ink-900/80 backdrop-blur-xl h-screen sticky top-0 z-30"
    >
      {/* Brand header */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-ink-200 dark:border-ink-800 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shrink-0 shadow-gov">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="min-w-0">
              <p className="text-sm font-bold text-ink-900 dark:text-white truncate leading-tight">{t('appShort')}</p>
              <p className="text-[11px] text-brand-600 dark:text-brand-400 truncate font-medium">{t('appSubtitle')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scroll-area">
        {groups.map((g) => {
          const visibleItems = g.items.filter((item) => hasPermission(item.perm as any));
          if (visibleItems.length === 0) return null;
          return (
          <div key={g.labelKey}>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-400 dark:text-ink-500"
                >
                  {t(g.labelKey)}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={sidebarCollapsed ? t(item.key) : undefined}
                  className={({ isActive }) => cn('nav-item', isActive && 'nav-item-active', sidebarCollapsed && 'justify-center px-2')}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} className="truncate">
                        {t(item.key)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              ))}
            </div>
          </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center gap-2 h-12 border-t border-ink-200 dark:border-ink-800 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition shrink-0"
      >
        <ChevronLeft className={cn('w-4 h-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
        {!sidebarCollapsed && <span className="text-xs font-medium">{t('settings')}</span>}
      </button>
    </motion.aside>
  );
}
