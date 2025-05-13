
import { Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function Roadmap() {
  // This is now just a redirect to the new roadmap page
  return (
    <ErrorBoundary>
      <Navigate to="/roadmap" replace />
    </ErrorBoundary>
  );
}
