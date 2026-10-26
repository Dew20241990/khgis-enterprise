import { useEffect } from 'react';
import { useApp } from '@/store/appStore';
import { applyDocumentSettings } from './documentSettings';

/** Keeps <html> dir/lang/dark-class in sync with the persisted locale and theme (all screens, incl. login). */
export function useDocumentSettings(): void {
  const locale = useApp((s) => s.locale);
  const theme = useApp((s) => s.theme);
  useEffect(() => {
    applyDocumentSettings(document.documentElement, locale, theme);
  }, [locale, theme]);
}
