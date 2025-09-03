
import { useState, lazy, Suspense, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronRight, CheckCircle, Presentation, FileText, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { InternalLinks } from '@/components/seo/InternalLinks';

// Lazy load components wrapped with error boundaries
const JourneyTimeline = lazy(() => import("@/components/JourneyTimeline"));
const JourneyProgressIndicator = lazy(() => import("@/components/journey/JourneyProgressIndicator"));

export default function Features() {
  const [journeyProgress, setJourneyProgress] = useState(74);
  const { t, translateContent } = useLanguage();
  const [dynamicContent, setDynamicContent] = useState({
    subHeading: "De l'idéation au financement : un accompagnement complet pour structurer votre projet et maximiser vos chances de succès.",
    ideaDesc: "Méthodologie pour transformer votre idée en concept viable et validé par le marché.",
    docsDesc: "Créez tous les documents nécessaires à la structuration de votre projet entrepreneurial.",
    pitchDesc: "Préparez votre pitch et identifiez les sources de financement adaptées à votre projet."
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Set a timeout to ensure the loading spinner is visible for a minimum time
    // This helps with perceived performance
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    // Translate content if needed
    const translateDynamicContent = async () => {
      try {
        setDynamicContent({
          subHeading: await translateContent("De l'idéation au financement : un accompagnement complet pour structurer votre projet et maximiser vos chances de succès."),
          ideaDesc: await translateContent("Méthodologie pour transformer votre idée en concept viable et validé par le marché."),
          docsDesc: await translateContent("Créez tous les documents nécessaires à la structuration de votre projet entrepreneurial."),
          pitchDesc: await translateContent("Préparez votre pitch et identifiez les sources de financement adaptées à votre projet.")
        });
      } catch (error) {
        console.error("Error translating content:", error);
      }
    };
    
    translateDynamicContent();
    
    return () => clearTimeout(timer);
  }, [translateContent]);
  
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
  
  return (
    <>
      <Helmet>
        <title>Fonctionnalités Fund Road - Outils pour entrepreneurs | Business Plan, Pitch Deck & Financement</title>
        <meta name="description" content="Découvrez tous nos outils pour structurer votre projet entrepreneurial : Business Model Canvas, templates pitch deck, guides de financement et accompagnement personnalisé." />
        <meta name="keywords" content="outils entrepreneurs, business model canvas, pitch deck template, guide financement, startup tools, business plan generator" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Fonctionnalités Fund Road - Outils complets pour entrepreneurs" />
        <meta property="og:description" content="Tous les outils nécessaires pour transformer votre idée en startup financée" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fundroad.com/fonctionnalites" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://fundroad.com/fonctionnalites" />
      </Helmet>
      
      <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <header className="container mx-auto px-4 mb-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("page.features") || "Fonctionnalités"}</h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              {t("features.subtitle") || dynamicContent.subHeading}
            </p>
          </div>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Progress Indicator - Lazy loaded with error handling */}
              <Suspense fallback={<Skeleton className="w-full h-20" />}>
                <JourneyProgressIndicator />
              </Suspense>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="glass-card p-6 rounded-lg">
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Lightbulb className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t("features.idea.title") || "Idéation & Validation"}</h3>
                  <p className="text-white/70 mb-4">
                    {t("features.idea.description") || dynamicContent.ideaDesc}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Validation du concept</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Problem-solution fit</span>
                    </li>
                  </ul>
                </div>
                
                <div className="glass-card p-6 rounded-lg">
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <FileText className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t("features.docs.title") || "Documentation & Structure"}</h3>
                  <p className="text-white/70 mb-4">
                    {t("features.docs.description") || dynamicContent.docsDesc}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Business Model Canvas</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Business Plan complet</span>
                    </li>
                  </ul>
                </div>
                
                <div className="glass-card p-6 rounded-lg">
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Presentation className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t("features.pitch.title") || "Pitch & Financement"}</h3>
                  <p className="text-white/70 mb-4">
                    {t("features.pitch.description") || dynamicContent.pitchDesc}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Pitch Deck investisseur</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Stratégie de financement</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-center mt-12">
                <Button asChild className="bg-gradient-to-r from-primary to-accent text-white px-8">
                  <Link to="/financing">
                    {t("button.learnMore") || "En savoir plus"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </header>
        
        {/* Timeline Section - Lazy loaded */}
        <section className="container mx-auto px-4 py-8">
          <div className="py-8 bg-gradient-to-b from-transparent to-black/40">
            <Suspense fallback={
              <div className="py-16 px-4">
                <div className="text-center mb-16">
                  <Skeleton className="h-10 w-96 mx-auto mb-4" />
                  <Skeleton className="h-6 w-2/3 mx-auto" />
                </div>
                <div className="space-y-12">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex">
                      <Skeleton className="h-7 w-7 rounded-full mr-4" />
                      <div className="w-full space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }>
              {!isLoading && <JourneyTimeline />}
            </Suspense>
          </div>
        </section>
        
        <InternalLinks currentPage="/fonctionnalites" />
      </main>
      
      <Footer />
    </div>
    </>
  );
}
