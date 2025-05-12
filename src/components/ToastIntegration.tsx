
import { Toaster, SonnerToasterProvider } from "@/components/ui/toaster";

export function ToastIntegration() {
  return (
    <>
      <Toaster />
      <SonnerToasterProvider />
    </>
  );
}
