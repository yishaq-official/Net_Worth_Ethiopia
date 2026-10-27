import { useToastStore, showInAppToast, dismissInAppToast, type ToastPayload, type ToastVariant } from '@/store/toast-store';

/**
 * Hook providing access to toast actions and state.
 */
export function useInAppToast() {
  const activeToast = useToastStore((state) => state.activeToast);
  const showToast = useToastStore((state) => state.showToast);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return {
    activeToast,
    showToast,
    dismissToast,
  };
}

export { showInAppToast, dismissInAppToast, type ToastPayload, type ToastVariant };
