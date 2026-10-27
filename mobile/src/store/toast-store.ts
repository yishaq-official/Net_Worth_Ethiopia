import { create } from 'zustand';

export type ToastVariant = 'payment' | 'warning' | 'milestone' | 'info';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastPayload {
  id?: string;
  title: string;
  message: string;
  variant?: ToastVariant;
  amount?: string;
  bank?: string;
  reference?: string;
  action?: ToastAction;
  duration?: number; // duration in ms, default 5000, 0 = persistent until dismissed
}

interface ToastState {
  activeToast: ToastPayload | null;
  showToast: (toast: ToastPayload) => void;
  dismissToast: () => void;
}

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  activeToast: null,

  showToast: (toast: ToastPayload) => {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }

    const toastWithDefaults: ToastPayload = {
      ...toast,
      id: toast.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      variant: toast.variant || 'info',
      duration: toast.duration ?? 5000,
    };

    set({ activeToast: toastWithDefaults });

    if (toastWithDefaults.duration && toastWithDefaults.duration > 0) {
      dismissTimer = setTimeout(() => {
        set({ activeToast: null });
        dismissTimer = null;
      }, toastWithDefaults.duration);
    }
  },

  dismissToast: () => {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    set({ activeToast: null });
  },
}));

/**
 * Convenience helper to display a toast from outside React component render cycles.
 */
export const showInAppToast = (toast: ToastPayload) => {
  useToastStore.getState().showToast(toast);
};

export const dismissInAppToast = () => {
  useToastStore.getState().dismissToast();
};
