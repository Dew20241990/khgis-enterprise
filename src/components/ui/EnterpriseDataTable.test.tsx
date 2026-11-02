import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useApp } from '@/store/appStore';
import { EnterpriseDataTable, type EnterpriseColumn, type FilterConfig } from './EnterpriseDataTable';

const download = vi.hoisted(() => vi.fn());
vi.mock('@/lib/importExport', () => ({ downloadFile: download }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface Row { id: string; name: string; status: 'active' | 'idle'; qty: number }
const ROWS: Row[] = [
  { id: 'a', name: 'Alpha', status: 'active', qty: 10 },
  { id: 'b', name: 'Bravo', status: 'idle', qty: 2 },
  { id: 'c', name: 'Charlie', status: 'active', qty: 33 },
];

/** Column and filter definitions are rebuilt with the active language on every render, like the feature pages do. */
function Harness({ rows = ROWS, onExport }: { rows?: Row[]; onExport?: (f: 'csv' | 'json') => void }) {
  const { t } = useApp();
  const statusLabel = (r: Row) => (r.status === 'active' ? t('active') : t('shared.status.idle'));
  const columns: EnterpriseColumn<Row>[] = [
    { key: 'name', header: t('name'), sortable: true, searchable: true, pinned: 'start' },
    { key: 'status', header: t('status'), exportValue: statusLabel },
    { key: 'qty', header: 'Qty', sortable: true, align: 'end' }, // i18n-ignore: test fixture header
  ];
  const filters: FilterConfig<Row>[] = [
    { key: 'status', label: t('status'), type: 'select', options: [{ value: 'active', label: t('active') }, { value: 'idle', label: t('shared.status.idle') }] },
  ];
  return <EnterpriseDataTable columns={columns} rows={rows} rowKey={(r) => r.id} filters={filters} exportName="things" onExport={onExport} />;
}

describe('EnterpriseDataTable', () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    download.mockClear();
    useApp.setState({ locale: 'en' });
    act(() => root.render(<Harness />));
  });
  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    useApp.setState({ locale: 'ar' });
  });

  const headers = () => [...host.querySelectorAll('thead th')].map((th) => th.textContent?.trim()).filter(Boolean);
  const bodyRows = () => [...host.querySelectorAll<HTMLElement>('tbody tr[data-row-id]')].map((tr) => tr.dataset.rowId);
  const click = (el: Element | null | undefined) => act(() => { (el as HTMLElement).click(); });
  const buttonByText = (re: RegExp) => [...host.querySelectorAll('button')].find((b) => re.test(b.textContent ?? ''));
  const setValue = (el: HTMLInputElement | HTMLSelectElement, value: string) => {
    const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value);
    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
  };

  it('relabels column headers and filters when the language changes (no frozen first-render columns)', () => {
    expect(headers()).toContain('Name');
    expect(headers()).toContain('Status');
    act(() => useApp.getState().setLocale('fr'));
    expect(headers()).toContain('Nom');
    expect(headers()).toContain('Statut');
    act(() => useApp.getState().setLocale('ar'));
    expect(headers()).toContain('الاسم');
  });

  it('applies the select filter to the rows (filters are not decorative)', () => {
    expect(bodyRows()).toEqual(['a', 'b', 'c']);
    click(buttonByText(/Filters/));
    const select = host.querySelector<HTMLSelectElement>('select#filter-status')!;
    act(() => setValue(select, 'idle'));
    expect(bodyRows()).toEqual(['b']);
    expect(buttonByText(/Filters/)?.textContent).toContain('(1)');
    act(() => setValue(select, 'all'));
    expect(bodyRows()).toEqual(['a', 'b', 'c']);
  });

  it('searches the displayed (translated) text, not the stored code', () => {
    const search = host.querySelector<HTMLInputElement>('input[type="search"]')!;
    act(() => setValue(search, 'idle'));
    expect(bodyRows()).toEqual(['b']);
    act(() => useApp.getState().setLocale('fr'));
    act(() => setValue(host.querySelector<HTMLInputElement>('input[type="search"]')!, 'inactif'));
    expect(bodyRows()).toEqual(['b']);
  });

  it('sorts numbers numerically and toggles direction', () => {
    click(host.querySelector('thead th:nth-of-type(4)')); // Qty (after the selection and pinned name columns)
    expect(bodyRows()).toEqual(['b', 'a', 'c']);
    click(host.querySelector('thead th:nth-of-type(4)'));
    expect(bodyRows()).toEqual(['c', 'a', 'b']);
  });

  it('uses logical alignment and pinning so the table mirrors in RTL', () => {
    const html = host.querySelector('table')!.outerHTML;
    expect(html).toContain('start-0');
    expect(html).toContain('text-end');
    expect(html).toContain('text-start');
    expect(html).not.toMatch(/\b(text-left|text-right|left-0|right-0)\b/);
  });

  it('keeps hidden columns hidden across re-renders and rebuilt column definitions', () => {
    click(buttonByText(/Columns/));
    const box = [...host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')].find((i) => i.parentElement?.textContent?.trim() === 'Qty')!;
    click(box);
    expect(headers()).not.toContain('Qty');
    act(() => useApp.getState().setLocale('fr'));
    expect(headers()).not.toContain('Qty');
  });

  it('reports 0–0 for an empty result and shows the localized empty message', () => {
    act(() => setValue(host.querySelector<HTMLInputElement>('input[type="search"]')!, 'zzz'));
    expect(host.textContent).toContain('0–0');
    expect(host.textContent).toContain('No results');
  });

  it('exports the visible rows as CSV with the displayed text and the given file name', () => {
    click(buttonByText(/Export/));
    click([...host.querySelectorAll('[role="menuitem"]')].find((b) => /CSV/.test(b.textContent ?? '')));
    expect(download).toHaveBeenCalledTimes(1);
    const [content, filename, mime] = download.mock.calls[0] as [string, string, string];
    expect(filename).toBe('things.csv');
    expect(mime).toContain('text/csv');
    const lines = content.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
    expect(lines[0]).toBe('"Name","Status","Qty"');
    expect(lines[1]).toBe('"Alpha","Active","10"');
    expect(lines).toHaveLength(4);
  });

  it('exports only the selected rows when some are selected', () => {
    const rowBox = host.querySelector<HTMLInputElement>('tbody tr[data-row-id="c"] input[type="checkbox"]')!;
    click(rowBox);
    click(buttonByText(/Export/));
    click([...host.querySelectorAll('[role="menuitem"]')].find((b) => /CSV/.test(b.textContent ?? '')));
    const content = (download.mock.calls[0] as [string])[0].replace(/^\uFEFF/, '').trim().split(/\r?\n/);
    expect(content).toHaveLength(2);
    expect(content[1]).toBe('"Charlie","Active","33"');
  });
});
