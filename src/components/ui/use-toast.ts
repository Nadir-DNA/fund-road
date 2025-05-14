
import * as ToastPrimitives from "@radix-ui/react-toast";
import { createContext, useContext } from "react";

// Define the action type that was being imported before
export type ToastActionType = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>;

// Create a context to store toast functions
export const ToastContext = createContext<{
  toast: (props: any) => void;
}>({
  toast: () => {}, // Default no-op function
});

// Export the useToast hook that can be used by other components
export function useToast() {
  const context = useContext(ToastContext);
  return context;
}

// Export a standalone toast function for convenience
export const toast = (props: any) => {
  // This will be properly defined in the toaster component
  console.warn("Toast called outside of ToastProvider context");
};
