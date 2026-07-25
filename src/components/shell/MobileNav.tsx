import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, Building2, Home, AlertTriangle, Trash2, Store,
  ClipboardCheck, Sparkles, Wrench, Truck, UserSquare2, Navigation,
  Factory, Briefcase, MessageSquareWarning, FileBarChart, BarChart3,
  PieChart, FolderArchive, Users, Shield, KeyRound, ScrollText,
  Settings, X, ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/store/appStore';
import { cn } from '@/lib/cn';

const items = [
  { to: '/', key: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, end: true, perm: 'dashboard' },
  { to: '/gis', key: 'gisMap', icon: <Map className="w-5 h-5" />, perm: 'gis' },
  { to: '/municipalities', key: 'municipalities', icon: <Building2 className="w-5 h-5" />, perm: 'municipalities' },
  { to: '/neighborhoods', key: 'neighborhoods', icon: <Home className="w-5 h-5" />, perm: 'neighborhoods' },
  { to: '/black-spots', key: 'blackSpots', icon: <AlertTriangle className="w-5 h-5" />, perm: 'black-spots' },
  { to: '/illegal-dumping', key: 'illegalDumping', icon: <Trash2 className="w-5 h-5" />, perm: 'illegal-dumping' },
  { to: '/containers', key: 'wasteContainers', icon: <Trash2 className="w-5 h-5" />, perm: 'containers' },
  { to: '/shops', key: 'commercialViolations', icon: <Store className="w-5 h-5" />, perm: 'shops' },
  { to: '/inspections', key: 'inspectionTours', icon: <ClipboardCheck className="w-5 h-5" />, perm: 'inspections' },
  { to: '/routes', key: 'cleaningOperations', icon: <Sparkles className="w-5 h-5" />, perm: 'routes' },
  { to: '/work-orders', key: 'workOrders', icon: <Wrench className="w-5 h-5" />, perm: 'work-orders' },
  { to: '/vehicles', key: 'vehicles', icon: <Truck className="w-5 h-5" />, perm: 'vehicles' },
  { to: '/drivers', key: 'drivers', icon: <UserSquare2 className="w-5 h-5" />, perm: 'drivers' },
  { to: '/truck-tracking', key: 'truckTracking', icon: <Navigation className="w-5 h-5" />, perm: 'truck-tracking' },
  { to: '/cet-centers', key: 'cetCenters', icon: <Factory className="w-5 h-5" />, perm: 'cet-centers' },
  { to: '/contractors', key: 'contractors', icon: <Briefcase className="w-5 h-5" />, perm: 'contractors' },
  { to: '/complaints', key: 'publicComplaints', icon: <MessageSquareWarning className="w-5 h-5" />, perm: 'complaints' },
  { to: '/reports', key: 'reports', icon: <FileBarChart className="w-5 h-5" />, perm: 'reports' },
  { to: '/analytics', key: 'analytics', icon: <BarChart3 className="w-5 h-5" />, perm: 'analytics' },
  { to: '/statistics', key: 'statistics', icon: <PieChart className="w-5 h-5" />, perm: 'statistics' },
  { to: '/documents', key: 'documents', icon: <FolderArchive className="w-5 h-5" />, perm: 'documents' },
  { to: '/users', key: 'users', icon: <Users className="w-5 h-5" />, perm: 'users' },
  { to: '/roles', key: 'roles', icon: <Shield className="w-5 h-5" />, perm: 'roles' },
  { to: '/permissions', key: 'permissions', icon: <KeyRound className="w-5 h-5" />, perm: 'permissions' },
  { to: '/audit-logs', key: 'auditLogs', icon: <ScrollText className="w-5 h-5" />, perm: 'audit-logs' },
  { to: '/ai-assistant', key: 'aiAssistant', icon: <Sparkles className="w-5 h-5" />, perm: 'ai-assistant' },
  { to: '/settings', key: 'settings', icon: <Settings className="w-5 h-5" />, perm: 'settings' },
];

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, hasPermission } = useApp();
  const visibleItems = items.filter((it) => hasPermission(it.perm as any));
  return (
    <AnimatePresence>
      {open && (
        <div className="lg:hidden fixed inset-0 z-[120]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.25 }}
            className="absolute top-0 bottom-0 right-0 w-80 bg-white dark:bg-ink-900 border-l border-ink-200 dark:border-ink-800 flex flex-col"
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-ink-200 dark:border-ink-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-gov"><ShieldCheck className="w-4 h-4 text-white" /></div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink-900 dark:text-white truncate">{t('appShort')}</p>
                  <p className="text-[11px] text-brand-600 dark:text-brand-400 truncate">{t('appSubtitle')}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1 scroll-area">
              {visibleItems.map((it) => (
                <NavLink key={it.to} to={it.to} end={it.end} onClick={onClose}
                  className={({ isActive }) => cn('nav-item', isActive && 'nav-item-active')}>
                  <span className="shrink-0">{it.icon}</span>
                  <span className="truncate">{t(it.key)}</span>
                </NavLink>
              ))}
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
