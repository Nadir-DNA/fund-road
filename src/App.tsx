
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { LanguageProvider } from "./context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import { LoadingIndicator } from "./components/ui/LoadingIndicator";
import CookieConsent from "./components/CookieConsent";
import { toast } from "./components/ui/use-toast";

// Lazy load non-critical pages
const Financing = lazy(() => import("./pages/Financing"));
const FAQ = lazy(() => import("./pages/FAQ"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const Contact = lazy(() => import("./pages/Contact"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

// Create a loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingIndicator size="lg" />
  </div>
);

const checkDeeplApiKey = async () => {
  if (!import.meta.env.VITE_DEEPL_API_KEY) {
    console.warn("DeepL API key is not set. Translations may not work properly.");
    return;
  }

  try {
    const { data, error } = await supabase.functions.invoke('check-deepl-key', {
      body: { testKey: true },
    });
    
    if (error || !data?.success) {
      console.error("DeepL API key validation failed:", error || data?.message);
      toast({
        title: "Translation Configuration Error",
        description: "There was an issue with the DeepL API key. Some content may not be translated properly.",
        variant: "destructive",
        duration: 6000,
      });
    } else {
      console.log("DeepL API key verified successfully");
    }
  } catch (e) {
    console.warn("Failed to check DeepL key in edge function:", e);
  }
};

setTimeout(() => {
  checkDeeplApiKey();
}, 2000);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: 1,
      networkMode: 'online'
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/features" element={<Navigate to="/roadmap" replace />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/financing" element={<Financing />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <CookieConsent />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
