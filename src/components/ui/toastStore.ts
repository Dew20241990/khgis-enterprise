/**
 * Toast state and the imperative `toast.*` helpers.
 * Kept separate from the <ToastContainer /> component so that component file only exports components.
 */

import { create } from 'zustand';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  add: (toast: Omit<ToastItem, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    const duration = toast.duration ?? 4000;
    if (duration > 0) setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), duration);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, message?: string) => useToastStore.getState().add({ type: 'success', title, message }),
  warning: (title: string, message?: string) => useToastStore.getState().add({ type: 'warning', title, message }),
  error: (title: string, message?: string) => useToastStore.getState().add({ type: 'error', title, message, duration: 6000 }),
  info: (title: string, message?: string) => useToastStore.getState().add({ type: 'info', title, message }),
};
