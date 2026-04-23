import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { Suspense, lazy } from "react";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import { useAuth } from "@/hooks/useAuth";
import { ToastIntegration } from "@/components/ToastIntegration";
import AuthGuard from "@/components/auth/AuthGuard";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Lazy-load des pages lourdes pour réduire le bundle initial
const Confirm = lazy(() => import("@/pages/Confirm"));
const RoadmapStartup = lazy(() => import("@/pages/RoadmapStartup"));
const RoadmapPage = lazy(() => import("@/pages/roadmap/RoadmapPage"));
const StepDetailPage = lazy(() => import("@/components/journey/step-detail/StepDetailPage"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogArticle = lazy(() => import("@/pages/BlogArticle"));
const Financing = lazy(() => import("@/pages/Financing"));
const NotFound = lazy(() => import("@/pages/NotFound"));

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

function LazyWrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
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
        
        <Route path="/confirm" element={<LazyWrap><Confirm /></LazyWrap>} />
        <Route path="/blog" element={<LazyWrap><Blog /></LazyWrap>} />
        <Route path="/blog/:slug" element={<LazyWrap><BlogArticle /></LazyWrap>} />
        <Route path="/roadmap-startup" element={<LazyWrap><RoadmapStartup /></LazyWrap>} />
        
        <Route path="/roadmap" element={
          <AuthGuard requireAuth={true}>
            <LazyWrap><RoadmapPage /></LazyWrap>
          </AuthGuard>
        } />
        <Route path="/roadmap/step/:stepId" element={
          <AuthGuard requireAuth={true}>
            <LazyWrap><StepDetailPage /></LazyWrap>
          </AuthGuard>
        } />
        <Route path="/roadmap/step/:stepId/:substepTitle" element={
          <AuthGuard requireAuth={true}>
            <LazyWrap><StepDetailPage /></LazyWrap>
          </AuthGuard>
        } />
        
        <Route path="/financing" element={
          <AuthGuard requireAuth={true}>
            <LazyWrap><Financing /></LazyWrap>
          </AuthGuard>
        } />
        
        <Route path="/step/:stepId" element={<StepRedirect />} />
        <Route path="/step/:stepId/:substepTitle" element={<SubstepRedirect />} />
        <Route path="*" element={<LazyWrap><NotFound /></LazyWrap>} />
      </Routes>
      <ToastIntegration />
    </ErrorBoundary>
  );
}

export default App;
