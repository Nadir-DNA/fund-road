import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { Suspense, lazy } from "react";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Confirm from "@/pages/Confirm";
import RoadmapStartup from "@/pages/RoadmapStartup";
import RoadmapPage from "@/pages/roadmap/RoadmapPage";
import StepDetailPage from "@/components/journey/step-detail/StepDetailPage";
import Blog from "@/pages/Blog";
import BlogArticle from "@/pages/BlogArticle";
import { useAuth } from "@/hooks/useAuth";
import { ToastIntegration } from "@/components/ToastIntegration";
import Financing from "@/pages/Financing";
import AuthGuard from "@/components/auth/AuthGuard";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { Loader2 } from "lucide-react";

function StepRedirect() {
  const { stepId } = useParams();
  return <Navigate to={`/roadmap/step/${stepId}`} replace />;
}

function SubstepRedirect() {
  const { stepId, substepTitle } = useParams();
  return <Navigate to={`/roadmap/step/${stepId}/${substepTitle}`} replace />;
}

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-foreground/50">Chargement...</p>
    </div>
  );
}

function App() {
  const { user, isAuthChecked } = useAuth();

  if (!isAuthChecked) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogArticle />} />
        <Route path="/roadmap-startup" element={<RoadmapStartup />} />
        
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
        
        <Route path="/financing" element={
          <AuthGuard requireAuth={true}>
            <Financing />
          </AuthGuard>
        } />
        
        <Route path="/step/:stepId" element={<StepRedirect />} />
        <Route path="/step/:stepId/:substepTitle" element={<SubstepRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastIntegration />
    </ErrorBoundary>
  );
}

export default App;
