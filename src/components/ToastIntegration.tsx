
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { ToastContext } from "@/components/ui/use-toast";

export function ToastIntegration() {
  const { toast, dismiss, toasts } = useToast();

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      <Toaster toasts={toasts} />
    </ToastContext.Provider>
  );
}
