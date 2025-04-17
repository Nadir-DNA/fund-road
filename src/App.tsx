
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { LanguageProvider } from "./context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Financing from "./pages/Financing";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import Roadmap from "./pages/Roadmap";
import AboutUs from "./pages/AboutUs";
import CookieConsent from "./components/CookieConsent";
import { toast } from "./components/ui/use-toast";

// DeepL API key check
const checkDeeplApiKey = async () => {
  if (!import.meta.env.VITE_DEEPL_API_KEY) {
    console.warn("DeepL API key is not set. Translations may not work properly.");
    return;
  }

  try {
    // Check if the DeepL API key is valid using the edge function
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

// Run the check when the app loads
setTimeout(() => {
  checkDeeplApiKey();
}, 2000); // Delay to ensure other components are loaded first

// Configure React Query with optimized settings for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookieConsent />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
