import { useEffect } from 'react';
import { useApp } from '@/store/appStore';

/** Viewport width (px) at and above which the sidebar opens by default. */
export const SIDEBAR_AUTO_OPEN_MIN_WIDTH = 1280;

/**
 * Opens the sidebar when the viewport grows past the breakpoint and collapses it when it shrinks
 * below. Only reacts when the breakpoint is crossed, so a manual toggle is respected until then.
 */
export function useAutoSidebar(): void {
  const setSidebarCollapsed = useApp((s) => s.setSidebarCollapsed);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(`(min-width: ${SIDEBAR_AUTO_OPEN_MIN_WIDTH}px)`);
    setSidebarCollapsed(!mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSidebarCollapsed(!e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [setSidebarCollapsed]);
}
