
import FinancingPage from "./financing/FinancingPage";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function Financing() {
  return (
    <ErrorBoundary>
      <FinancingPage />
    </ErrorBoundary>
  );
}
