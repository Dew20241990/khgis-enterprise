import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useApp } from '@/store/appStore';
import { SmartForm, type FormField, type FormValues } from './SmartForm';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Rebuilds the field definitions with the active language on every render, exactly like the feature pages do. */
function Harness({ onSubmit }: { onSubmit: (v: FormValues) => void }) {
  const { t } = useApp();
  const fields: FormField[] = [
    { key: 'name', label: t('name'), type: 'text', required: true },
    { key: 'status', label: t('status'), type: 'select', options: [{ value: 'active', label: t('active') }] },
  ];
  return <SmartForm fields={fields} onSubmit={onSubmit} />;
}

function typeInto(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('SmartForm and language switching', () => {
  let host: HTMLDivElement;
  let root: Root;
  const onSubmit = vi.fn();

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    onSubmit.mockClear();
    useApp.setState({ locale: 'en' });
  });
  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    useApp.setState({ locale: 'ar' });
  });

  const nameInput = () => host.querySelector<HTMLInputElement>('input[type="text"]')!;
  const submit = () => host.querySelector<HTMLButtonElement>('button.btn-primary')!;
  const labelFor = (input: HTMLElement) => host.querySelector(`label[for="${input.id}"]`)?.textContent ?? '';

  it('keeps typed values and the same DOM node when the language changes, and relabels the field', () => {
    act(() => root.render(<Harness onSubmit={onSubmit} />));
    const input = nameInput();
    expect(labelFor(input)).toContain('Name');

    act(() => typeInto(input, 'Collection route 7'));
    expect(input.value).toBe('Collection route 7');

    act(() => useApp.getState().setLocale('fr'));
    expect(nameInput()).toBe(input); // not remounted
    expect(input.value).toBe('Collection route 7');
    expect(labelFor(input)).toContain('Nom');

    act(() => useApp.getState().setLocale('ar'));
    expect(nameInput()).toBe(input);
    expect(input.value).toBe('Collection route 7');
    expect(labelFor(input)).toContain('الاسم');
  });

  it('re-renders a visible validation message in the new language and clears it once the value is valid', () => {
    act(() => root.render(<Harness onSubmit={onSubmit} />));
    act(() => submit().click());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(host.textContent).toContain('This field is required');

    act(() => useApp.getState().setLocale('fr'));
    expect(host.textContent).toContain('Ce champ est obligatoire');
    expect(host.textContent).not.toContain('This field is required');

    act(() => useApp.getState().setLocale('ar'));
    expect(host.textContent).toContain('هذا الحقل مطلوب');

    act(() => typeInto(nameInput(), 'Route 7'));
    expect(host.textContent).not.toContain('هذا الحقل مطلوب');
  });

  it('submits the values that were typed before the language was switched', async () => {
    act(() => root.render(<Harness onSubmit={onSubmit} />));
    act(() => typeInto(nameInput(), 'Route 7'));
    act(() => useApp.getState().setLocale('fr'));
    await act(async () => { submit().click(); });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: 'Route 7' });
  });

  it('translates select options and the empty choice with the active language', () => {
    act(() => root.render(<Harness onSubmit={onSubmit} />));
    const options = () => [...host.querySelectorAll('select option')].map((o) => o.textContent);
    expect(options()).toEqual(['— Select —', 'Active']);
    act(() => useApp.getState().setLocale('fr'));
    expect(options()).toEqual(['— Sélectionner —', 'Actif']);
  });
});
