
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import SubstepPage from "@/pages/SubstepPage";
import { useAuth } from "@/hooks/useAuth";
import { ToastIntegration } from "@/components/ToastIntegration";

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
    <>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Index />} />
        
        {/* Auth page */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Simple direct route to substep page */}
        <Route path="/roadmap/step/:stepId/:substepTitle" element={<SubstepPage />} />
        
        {/* Legacy compatibility route - using wrapper components */}
        <Route path="/step/:stepId" element={<StepRedirect />} />
        <Route path="/step/:stepId/:substepTitle" element={<SubstepRedirect />} />
        
        {/* Fallback for routes not found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastIntegration />
    </>
  );
}

export default App;
