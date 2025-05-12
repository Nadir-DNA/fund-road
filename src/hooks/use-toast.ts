
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
};

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

export const useToast = () => {
  return { toast };
};
