import { toast as sonnerToast } from "sonner";
import { useToast as useShadcnToast } from "@/components/ui/toast";
import { useState, useCallback } from "react";

type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
};

// Basic toast function for direct usage
export const toast = ({
  title,
  description,
  variant = "default",
  duration = 3000,
}: ToastProps) => {
  const toastFn = variant === "destructive" 
    ? sonnerToast.error 
    : variant === "success" 
    ? sonnerToast.success 
    : sonnerToast;

  return toastFn(title, {
    description,
    duration,
  });
};

// Extended hook with toast list management for shadcn/ui toast
export const useToast = () => {
  // We keep the compatibility with shadcn toast for components that need it
  const shadcnToast = useShadcnToast();
  
  // Return a combined object with both the direct toast function and shadcn toast methods
  return { 
    toast,
    ...shadcnToast // This includes the toasts array needed by the Toaster component
  };
};
