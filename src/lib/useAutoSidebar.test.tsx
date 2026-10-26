import { describe, expect, it, vi, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useApp } from '@/store/appStore';
import { useAutoSidebar } from './useAutoSidebar';

function mockMatchMedia(initial: boolean) {
  let listener: ((e: { matches: boolean }) => void) | null = null;
  const mq = {
    matches: initial,
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => { listener = cb; },
    removeEventListener: () => { listener = null; },
  };
  window.matchMedia = vi.fn(() => mq) as unknown as typeof window.matchMedia;
  return (matches: boolean) => listener?.({ matches });
}

function Probe() { useAutoSidebar(); return null; }

describe('useAutoSidebar', () => {
  afterEach(() => { useApp.setState({ sidebarCollapsed: false }); });

  it('collapses on narrow screens, opens when the viewport grows, respects manual toggles in between', () => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const fire = mockMatchMedia(false);
    const root = createRoot(document.createElement('div'));
    act(() => root.render(<Probe />));
    expect(useApp.getState().sidebarCollapsed).toBe(true);

    act(() => fire(true));
    expect(useApp.getState().sidebarCollapsed).toBe(false);

    act(() => useApp.getState().toggleSidebar());
    expect(useApp.getState().sidebarCollapsed).toBe(true);

    act(() => fire(false));
    expect(useApp.getState().sidebarCollapsed).toBe(true);
    act(() => root.unmount());
    expect(renderToString(<span />)).toBe('<span></span>');
  });
});
