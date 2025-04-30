
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import NotFound from "@/pages/NotFound";
import Roadmap from "@/pages/Roadmap";
import StepDetail from "@/pages/StepDetail";
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
        <Route path="/roadmap" element={<Roadmap />} />
        
        {/* Nouvelles routes pour les étapes */}
        <Route path="/step/:stepId" element={<StepDetail />} />
        <Route path="/step/:stepId/:substepTitle" element={<StepDetail />} />
        <Route path="/step/:stepId/:substepTitle/resource/:resource" element={<StepDetail />} />
        
        {/* Fallback pour les routes non trouvées */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastIntegration />
    </>
  );
}

export default App;
