
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { LanguageProvider } from "./context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Financing from "./pages/Financing";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import CookieConsent from "./components/CookieConsent";

// DeepL API key from environment variable
if (!import.meta.env.VITE_DEEPL_API_KEY) {
  console.warn("DeepL API key is not set. Translations may not work properly.");
}

// Create a Supabase edge function secret with the same key
// The edge function will use this to call DeepL API
try {
  supabase.functions.invoke('check-deepl-key', {
    body: { testKey: true },
  });
} catch (e) {
  console.warn("Failed to check DeepL key in edge function:", e);
}

const queryClient = new QueryClient();

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
              <Route path="/features" element={<Features />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/financing" element={<Financing />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/contact" element={<Contact />} />
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
