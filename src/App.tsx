
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Confirm from "@/pages/Confirm";
import RoadmapPage from "@/pages/roadmap/RoadmapPage";
import StepDetailPage from "@/components/journey/step-detail/StepDetailPage";
import { useAuth } from "@/hooks/useAuth";
import { ToastIntegration } from "@/components/ToastIntegration";
import Financing from "@/pages/Financing";
import AuthGuard from "@/components/auth/AuthGuard";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

// Custom wrapper components for redirects that need URL parameters
function StepRedirect() {
  const { stepId } = useParams();
  return <Navigate to={`/roadmap/step/${stepId}`} replace />;
}

function SubstepRedirect() {
  const { stepId, substepTitle } = useParams();
  return <Navigate to={`/roadmap/step/${stepId}/${substepTitle}`} replace />;
}

function App() {
  const { user, isAuthChecked } = useAuth();

  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        {/* Home page - Accessible sans authentification */}
        <Route path="/" element={<Index />} />
        
        {/* Auth page - Accessible sans authentification */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Confirmation page - Accessible sans authentification */}
        <Route path="/confirm" element={<Confirm />} />
        
        {/* Toutes les pages du roadmap nécessitent une authentification */}
        <Route path="/roadmap" element={
          <AuthGuard requireAuth={true}>
            <RoadmapPage />
          </AuthGuard>
        } />
        
        <Route path="/roadmap/step/:stepId" element={
          <AuthGuard requireAuth={true}>
            <StepDetailPage />
          </AuthGuard>
        } />
        
        <Route path="/roadmap/step/:stepId/:substepTitle" element={
          <AuthGuard requireAuth={true}>
            <StepDetailPage />
          </AuthGuard>
        } />
        
        {/* Keep the Financing page separate as requested */}
        <Route path="/financing" element={
          <AuthGuard requireAuth={true}>
            <Financing />
          </AuthGuard>
        } />
        
        {/* Legacy compatibility routes */}
        <Route path="/step/:stepId" element={<StepRedirect />} />
        <Route path="/step/:stepId/:substepTitle" element={<SubstepRedirect />} />
        
        {/* Fallback for routes not found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastIntegration />
    </ErrorBoundary>
  );
}

export default App;
