
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import { useToast as useToastInternal } from "@/components/ui/use-toast";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

export const useToast = useToastInternal;

export const toast = useToastInternal().toast;

export type { ToasterToast };
