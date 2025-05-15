
import { useState, useCallback } from 'react';
import type { ToastProps } from '@/components/ui/use-toast';

// Helper to generate unique IDs for toasts
let count = 0;
function generateId() {
  return `toast-${++count}`;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(function(props: Omit<ToastProps, "id">) {
    const id = generateId();
    const newToast = { ...props, id };
    
    setToasts((prevToasts) => {
      // Remove oldest toast if we reach the limit
      if (prevToasts.length >= 10) {
        return [...prevToasts.slice(1), newToast];
      }
      return [...prevToasts, newToast];
    });
    
    return {
      id,
      dismiss: () => dismiss(id),
    };
  }, []);

  const dismiss = useCallback(function(toastId: string) {
    setToasts((prevToasts) => 
      prevToasts.filter((toast) => toast.id !== toastId)
    );
  }, []);

  return {
    toasts,
    toast,
    dismiss,
  };
}

// Export a standalone toast function
export const toast = (props: Omit<ToastProps, "id">) => {
  console.warn("Standalone toast function called outside of component context");
  // This is just a placeholder that will be replaced by the real implementation
  // from ToastContext at runtime
  return {
    id: 'placeholder',
    dismiss: () => {},
  };
};
