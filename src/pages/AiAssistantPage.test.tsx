import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { containers } from '@/data/mockData';
import { useApp } from '@/store/appStore';
import { AiAssistantPage } from './AiAssistantPage';

const download = vi.hoisted(() => vi.fn());
vi.mock('@/lib/importExport', () => ({ downloadFile: download }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('AiAssistantPage is an honest local analyser', () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    download.mockClear();
    useApp.setState({ locale: 'en' });
    act(() => root.render(<AiAssistantPage />));
  });
  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    useApp.setState({ locale: 'ar' });
  });

  const t = (key: Parameters<ReturnType<typeof useApp.getState>['t']>[0]) => useApp.getState().t(key);
  const buttonByText = (text: string) => [...host.querySelectorAll('button')].find((b) => b.textContent?.includes(text));
  const click = (el: Element | undefined | null) => act(() => { (el as HTMLElement).click(); });
  const typeText = (value: string) => {
    const input = host.querySelector<HTMLInputElement>('input')!;
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
  const send = () => click(host.querySelector('button[type="submit"]'));
  const over = containers.filter((c) => c.fillLevel > 90).length;

  it('never claims a connected AI model or a fixed user, in any language', () => {
    for (const locale of ['ar', 'fr', 'en'] as const) {
      act(() => useApp.getState().setLocale(locale));
      expect(host.textContent).not.toMatch(/gpt/i);
      expect(host.textContent).not.toContain('سفيان');
      expect(host.querySelector('[role="note"]')?.textContent).toContain(t('assistant.notice.title'));
      expect(host.textContent).toContain(t('assistant.badge'));
    }
  });

  it('does not show fake image-analysis results or dead attachment buttons', () => {
    expect(host.querySelector('img')).toBeNull(); // the old page loaded a stock photo with invented "87% waste" overlays
    expect(host.textContent).not.toMatch(/87%|2\.4/);
    // every button is either a real action or the disabled send button
    const labels = [...host.querySelectorAll('button')].map((b) => b.getAttribute('aria-label') ?? b.textContent?.trim());
    expect(labels).not.toContain('');
  });

  it('answers a suggested question from the data, with the exact figures', () => {
    click(buttonByText('Which containers need urgent emptying?'));
    expect(host.textContent).toContain(`${containers.length} containers checked`);
    expect(host.textContent).toContain(`${over} containers are above 90% full`);
  });

  it('keeps every container code on one line (no break at the hyphen on narrow screens)', () => {
    click(buttonByText('Which containers need urgent emptying?'));
    const card = [...host.querySelectorAll('p')].find((p) => /CTN-\d+/.test(p.textContent ?? ''))!;
    const codes = card.textContent!.match(/CTN-\d+/g)!;
    expect(codes.length).toBeGreaterThan(0);
    // each code is its own non-wrapping span, and the characters are untouched (no U+2011 substitution), so copy and search still work
    expect([...card.querySelectorAll('span.whitespace-nowrap')].map((s) => s.textContent)).toEqual(codes);
    expect(card.textContent).not.toContain('‑');
  });

  it('matches typed questions, and says honestly when it cannot answer', () => {
    expect(host.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
    typeText('Which containers need urgent emptying?');
    send();
    expect(host.textContent).toContain(`${over} containers are above 90% full`);
    expect(host.querySelector<HTMLInputElement>('input')!.value).toBe('');

    typeText('tell me a joke');
    send();
    expect(host.textContent).toContain('I did not understand the question');
  });

  it('relabels earlier answers when the language changes (the chat keeps data, not translated text)', () => {
    click(buttonByText('Which containers need urgent emptying?'));
    act(() => useApp.getState().setLocale('fr'));
    expect(host.textContent).toContain(`${over} conteneurs dépassent 90 % de remplissage`);
    expect(host.textContent).not.toContain('containers are above');
    act(() => useApp.getState().setLocale('ar'));
    expect(host.textContent).toContain(`${over} حاوية يتجاوز امتلاؤها 90%`);
  });

  it('exports exactly the rows of the displayed result as CSV', () => {
    expect(buttonByText(t('assistant.exportCsv'))).toBeUndefined(); // nothing to export before an analysis ran
    click(buttonByText('Which containers need urgent emptying?'));
    click(buttonByText(t('assistant.exportCsv')));
    expect(download).toHaveBeenCalledTimes(1);
    const [content, filename, mime] = download.mock.calls[0] as [string, string, string];
    expect(filename).toBe('assistant-urgentContainers.csv');
    expect(mime).toContain('text/csv');
    const lines = content.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
    expect(lines[0]).toBe(`"${t('assistant.col.code')}","${t('municipality')}","${t('assistant.col.fillPercent')}"`);
    expect(lines).toHaveLength(over + 1);
  });
});
