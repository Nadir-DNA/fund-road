
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App";
import "./index.css";
import { initializeApp } from "./utils/initializeApp";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { SeoOptimizedApp } from "./components/seo/SeoOptimizedApp";

// Initialiser les fonctionnalités de l'application
initializeApp();

// Créer une instance QueryClient avec des options par défaut
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <LanguageProvider>
              <SeoOptimizedApp>
                <App />
              </SeoOptimizedApp>
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
