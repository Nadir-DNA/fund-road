
import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import RoadmapPage from "@/pages/roadmap/RoadmapPage";
import StepDetailPage from "@/pages/roadmap/StepDetailPage";
import { useAuth } from "@/hooks/useAuth";
import { ToastIntegration } from "@/components/ToastIntegration";

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
        
        {/* Legacy compatibility route */}
        <Route path="/step/:stepId" element={<StepDetailPage />} />
        <Route path="/step/:stepId/:substepTitle" element={<StepDetailPage />} />
        
        {/* Fallback for routes not found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastIntegration />
    </>
  );
}

export default App;
