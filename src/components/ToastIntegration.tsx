
import { Toaster, SonnerToasterProvider } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { ToastContext } from "@/components/ui/use-toast";

export function ToastIntegration() {
  const { toast: hookToast } = useToast();

  return (
    <ToastContext.Provider value={{ toast: hookToast }}>
      <Toaster />
      <SonnerToasterProvider />
    </ToastContext.Provider>
  );
}
