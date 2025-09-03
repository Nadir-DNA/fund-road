import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import { SeoOptimizedApp } from '@/components/seo/SeoOptimizedApp';
import { ToastIntegration } from '@/components/ToastIntegration';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { initializeApp } from '@/utils/initializeApp';
import '@/styles/globals.css';

// Initialize app features
initializeApp();

export default function App({ Component, pageProps }: AppProps) {
  // Create QueryClient instance with optimized settings
  const [queryClient] = useState(
    () =>
      new QueryClient({
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
      })
  );

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <LanguageProvider>
              <SeoOptimizedApp>
                <Component {...pageProps} />
                <ToastIntegration />
              </SeoOptimizedApp>
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}