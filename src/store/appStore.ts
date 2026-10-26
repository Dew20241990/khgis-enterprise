import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/i18n/translations';
import { translate } from '@/i18n/translations';
import { authenticate, findSessionUser, type SessionUser, type Permission } from '@/lib/auth';

type ThemeMode = 'light' | 'dark';

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;

interface AppState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (m: ThemeMode) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  notifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
  // Auth
  user: SessionUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  hasPermission: (perm: Permission) => boolean;
  canEdit: () => boolean;
  lastActivity: number;
  touchActivity: () => void;
  checkInactivity: () => void;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      locale: 'ar',
      setLocale: (locale) => set({ locale }),
      t: (key) => translate(get().locale, key),
      theme: 'light',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      commandOpen: false,
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      notifOpen: false,
      setNotifOpen: (notifOpen) => set({ notifOpen }),
      // Auth
      user: null,
      isAuthenticated: false,
      login: (username, password) => {
        const user = authenticate(username, password);
        if (user) {
          set({ user, isAuthenticated: true, lastActivity: Date.now() });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      hasPermission: (perm) => {
        const u = get().user;
        if (!u) return false;
        return u.permissions.includes(perm);
      },
      canEdit: () => {
        const u = get().user;
        return u !== null && !u.readonly;
      },
      lastActivity: Date.now(),
      touchActivity: () => set({ lastActivity: Date.now() }),
      checkInactivity: () => {
        const { isAuthenticated, lastActivity } = get();
        if (isAuthenticated && Date.now() - lastActivity > INACTIVITY_LIMIT_MS) {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'sanitation-app',
      version: 2,
      // Persist only the username: permissions/roles are rebuilt from source on load, so editing
      // localStorage cannot grant roles, and no password is ever stored.
      partialize: (s) => ({
        locale: s.locale,
        theme: s.theme,
        sidebarCollapsed: s.sidebarCollapsed,
        username: s.user?.username ?? null,
        lastActivity: s.lastActivity,
      }),
      migrate: (persisted) => {
        // v1 stored the whole user object (including its password). Keep only safe fields.
        const old = (persisted ?? {}) as { locale?: Locale; theme?: ThemeMode; sidebarCollapsed?: boolean; lastActivity?: number; user?: { username?: string } | null };
        return { locale: old.locale, theme: old.theme, sidebarCollapsed: old.sidebarCollapsed, lastActivity: old.lastActivity, username: old.user?.username ?? null };
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as { locale?: Locale; theme?: ThemeMode; sidebarCollapsed?: boolean; lastActivity?: number; username?: string | null };
        const user = findSessionUser(p.username);
        return {
          ...current,
          locale: p.locale ?? current.locale,
          theme: p.theme ?? current.theme,
          sidebarCollapsed: p.sidebarCollapsed ?? current.sidebarCollapsed,
          lastActivity: p.lastActivity ?? current.lastActivity,
          user,
          isAuthenticated: user !== null,
        };
      },
    },
  ),
);
