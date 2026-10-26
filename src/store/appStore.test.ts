import { beforeEach, describe, expect, it } from 'vitest';
import { authenticate, findSessionUser } from '@/lib/auth';

const KEY = 'sanitation-app';

async function freshStore() {
  const { vi } = await import('vitest');
  vi.resetModules();
  return (await import('./appStore')).useApp;
}

describe('auth helpers', () => {
  it('never returns a password in the session user', () => {
    const u = authenticate('admin', 'admin');
    expect(u).not.toBeNull();
    expect('password' in (u as object)).toBe(false);
  });

  it('rejects wrong credentials', () => {
    expect(authenticate('admin', 'nope')).toBeNull();
    expect(authenticate('ghost', 'admin')).toBeNull();
  });

  it('rebuilds a user from its username only', () => {
    expect(findSessionUser('wali')?.role).toBe('wali');
    expect(findSessionUser('ghost')).toBeNull();
    expect(findSessionUser(null)).toBeNull();
  });
});

describe('persisted app state', () => {
  beforeEach(() => localStorage.clear());

  it('stores only the username after login, never the password or permissions', async () => {
    const useApp = await freshStore();
    expect(useApp.getState().login('admin', 'admin')).toBe(true);
    const raw = localStorage.getItem(KEY) ?? '';
    expect(raw).not.toMatch(/password/i);
    expect(raw).not.toMatch(/permissions/);
    expect(JSON.parse(raw).state.username).toBe('admin');
  });

  it('ignores a tampered role/permissions blob and rebuilds from the username', async () => {
    localStorage.setItem(KEY, JSON.stringify({
      version: 2,
      state: { username: 'contractor', user: { username: 'contractor', role: 'admin', permissions: ['users'] } },
    }));
    const useApp = await freshStore();
    const s = useApp.getState();
    expect(s.isAuthenticated).toBe(true);
    expect(s.user?.role).toBe('contractor');
    expect(s.hasPermission('users')).toBe(false);
  });

  it('drops an unknown username', async () => {
    localStorage.setItem(KEY, JSON.stringify({ version: 2, state: { username: 'ghost' } }));
    const s = (await freshStore()).getState();
    expect(s.isAuthenticated).toBe(false);
    expect(s.user).toBeNull();
  });

  it('migrates the old v1 state (full user object with password) to username only', async () => {
    localStorage.setItem(KEY, JSON.stringify({
      version: 0,
      state: { locale: 'fr', theme: 'dark', user: { username: 'wali', password: 'admin', role: 'wali' }, isAuthenticated: true },
    }));
    const useApp = await freshStore();
    const s = useApp.getState();
    expect(s.locale).toBe('fr');
    expect(s.theme).toBe('dark');
    expect(s.user?.username).toBe('wali');
    expect('password' in (s.user as object)).toBe(false);
    useApp.getState().setLocale('en'); // forces a re-persist
    expect(localStorage.getItem(KEY)).not.toMatch(/password/i);
  });

  it('logout clears the persisted username', async () => {
    const useApp = await freshStore();
    useApp.getState().login('admin', 'admin');
    useApp.getState().logout();
    expect(JSON.parse(localStorage.getItem(KEY) ?? '{}').state.username).toBeNull();
  });
});
