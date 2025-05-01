
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import RoadmapPage from "@/pages/RoadmapPage";
import StepDetailPage from "@/pages/StepDetailPage";
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
        <Route path="/" element={<Navigate to="/roadmap" replace />} />
        
        {/* Roadmap routes with nested structure */}
        <Route path="/roadmap" element={<RoadmapPage />}>
          <Route path="step/:stepId" element={<StepDetailPage />} />
          <Route path="step/:stepId/:substepTitle" element={<StepDetailPage />} />
        </Route>
        
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
