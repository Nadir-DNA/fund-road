
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import { useState, useCallback, useEffect } from "react";

// Define the toast data structure
export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// Create our own implementation
const TOAST_LIMIT = 10;
const TOAST_REMOVE_DELAY = 1000;

type ToasterToastState = {
  toasts: ToasterToast[];
};

let count = 0;

function generateId() {
  return `toast-${++count}`;
}

export function useToast() {
  const [state, setState] = useState<ToasterToastState>({
    toasts: [],
  });

  const toast = useCallback((props: Omit<ToasterToast, "id">) => {
    const id = generateId();
    const newToast = { id, ...props };
    
    setState((state) => {
      const newToasts = [...state.toasts];
      
      if (newToasts.length >= TOAST_LIMIT) {
        newToasts.shift();
      }
      
      return {
        ...state,
        toasts: [...newToasts, newToast],
      };
    });
    
    return {
      id,
      dismiss: () => {
        setState((state) => ({
          ...state,
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },
    };
  }, []);

  const dismiss = useCallback((toastId: string) => {
    setState((state) => ({
      ...state,
      toasts: state.toasts.filter((t) => t.id !== toastId),
    }));
  }, []);

  return {
    ...state,
    toast,
    dismiss,
  };
}

// Export the standalone toast function for ease of use
export const toast = (props: Omit<ToasterToast, "id">) => {
  const { toast } = useToast();
  return toast(props);
};
