import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { findSessionUser } from '@/lib/auth';
import { useApp } from '@/store/appStore';
import { SettingsPage } from './SettingsPage';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('SettingsPage only offers what really works', () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    vi.stubEnv('VITE_TELEMETRY_URL', '');
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    useApp.setState({ locale: 'en', theme: 'light', user: findSessionUser('admin') });
    act(() => root.render(<SettingsPage />));
  });
  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    vi.unstubAllEnvs();
    useApp.setState({ locale: 'ar', theme: 'light', user: null });
  });

  const t = (key: Parameters<ReturnType<typeof useApp.getState>['t']>[0]) => useApp.getState().t(key);
  const buttons = () => [...host.querySelectorAll('button')];
  const click = (el: Element | undefined | null) => act(() => { (el as HTMLElement).click(); });
  const sidebarButtons = () => [...host.querySelector('[class*="lg:col-span-1"]')!.querySelectorAll('button')];
  const openTab = (label: string) => click(sidebarButtons().find((b) => b.textContent?.trim() === label));
  const chips = () => [...host.querySelectorAll('span.chip')].map((c) => c.textContent?.trim());

  it('has no fake Save button and no hard-coded identity', () => {
    expect(buttons().some((b) => /^(save|حفظ|enregistrer)$/i.test(b.textContent?.trim() ?? ''))).toBe(false);
    expect(host.textContent).not.toContain('تم الحفظ');
    for (const leaked of ['سفيان', 'benomar', '0550']) expect(host.textContent).not.toContain(leaked);
    expect(host.textContent).toContain(t('settings.demo.body'));
  });

  it('shows the signed-in demo account read-only', () => {
    const inputs = [...host.querySelectorAll<HTMLInputElement>('input')];
    expect(inputs.length).toBeGreaterThan(0);
    expect(inputs.every((i) => i.readOnly)).toBe(true);
    const values = inputs.map((i) => i.value);
    expect(values).toContain('System Administrator');
    expect(values).toContain('admin');
    expect(values).toContain('admin@khenchela-gov.dz');
  });

  it('offers no password or two-factor form (nothing could process it)', () => {
    openTab(t('settings.tab.security'));
    expect(host.querySelectorAll('input').length).toBe(0);
    expect(host.textContent).toContain(t('settings.security.demoGate'));
    expect(host.textContent).toContain(t('settings.security.needsServer'));
  });

  it('notification preferences are labelled not implemented and have no switches', () => {
    openTab(t('notifications'));
    expect(chips()).toEqual(Array(5).fill(t('settings.int.status.notImplemented')));
    expect(host.querySelectorAll('input[type="checkbox"], [role="switch"]').length).toBe(0);
  });

  it('integrations show their real status: four not implemented, two optional ones configured only through the environment', () => {
    openTab(t('settings.tab.integrations'));
    const notImplemented = t('settings.int.status.notImplemented');
    const notConfigured = t('settings.int.status.notConfigured');
    expect(chips()).toEqual([notImplemented, notImplemented, notImplemented, notImplemented, notConfigured, notConfigured]);
    expect(host.querySelectorAll('input[type="checkbox"], [role="switch"]').length).toBe(0);

    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.invalid');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'placeholder');
    openTab(t('language')); // leave and re-enter the tab so the status is recomputed
    openTab(t('settings.tab.integrations'));
    expect(chips()[4]).toBe(t('settings.int.status.configured'));
    expect(chips()[5]).toBe(notConfigured);
  });

  it('the language and theme controls really change the application', () => {
    openTab(t('language'));
    click(buttons().find((b) => b.textContent?.includes('Français')));
    expect(useApp.getState().locale).toBe('fr');
    click(buttons().find((b) => b.textContent?.includes('English')));
    expect(useApp.getState().locale).toBe('en');

    openTab(t('settings.tab.appearance'));
    click(buttons().find((b) => b.textContent?.includes(t('darkMode'))));
    expect(useApp.getState().theme).toBe('dark');
  });

  it.each(['fr', 'en'] as const)('contains no Arabic text in %s (except the language names)', (locale) => {
    act(() => useApp.getState().setLocale(locale));
    const tabCount = sidebarButtons().length;
    expect(tabCount).toBe(7);
    for (let i = 0; i < tabCount; i++) {
      const tab = sidebarButtons()[i];
      if (tab.textContent?.trim() === t('language')) continue; // the language picker shows each language by its own name
      click(tab);
      expect(host.textContent).not.toMatch(/[؀-ۿ]/);
    }
  });
});
