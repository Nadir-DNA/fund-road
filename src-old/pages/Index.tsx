
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/home/HeroSection';
import RoadmapSection from '@/components/home/RoadmapSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import DashboardSection from '@/components/home/DashboardSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import ResourceCard from '@/components/ResourceCard';
import { Button } from '@/components/ui/button';
import { FileText, Shield, Rocket, ArrowRight, CheckCircle } from 'lucide-react';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { InternalLinks } from '@/components/seo/InternalLinks';
import { createOrganizationSchema, createWebSiteSchema } from '@/components/seo/StructuredData';
import { useLanguage } from '@/context/LanguageContext';

export default function Index() {
  const [isCookieConsentVisible, setIsCookieConsentVisible] = useState(false);
  const { t } = useLanguage();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCookieConsentVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // SEO schemas
  const organizationSchema = createOrganizationSchema();
  const websiteSchema = createWebSiteSchema();
  
  return (
    <>
      <Helmet>
        <title>{t("seo.homepage.title")}</title>
        <meta name="description" content={t("seo.homepage.description")} />
        <meta name="keywords" content="levée de fonds, startup, business plan, pitch deck, financement startup, accompagnement entrepreneur, business model canvas, investisseur, venture capital" />
        
        {/* Open Graph */}
        <meta property="og:title" content={t("seo.homepage.ogTitle")} />
        <meta property="og:description" content={t("seo.homepage.ogDescription")} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fundroad.com/" />
        <meta property="og:image" content="https://fundroad.com/og-homepage.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t("seo.homepage.ogTitle")} />
        <meta name="twitter:description" content={t("seo.homepage.ogDescription")} />
        
        {/* Canonical */}
        <link rel="canonical" href="https://fundroad.com/" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-black text-white">
      <ErrorBoundary>
        <Navbar />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <HeroSection />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <RoadmapSection />
      </ErrorBoundary>
      
      <section className="py-24 bg-gradient-to-b from-slate-900 to-black relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t("services.title")} <span className="text-gradient">{t("services.titleHighlight")}</span> {t("services.titleEnd")}
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              {t("services.subtitle")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Investors Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-white/10 p-8 hover:border-green-500/30 transition-all duration-500 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Rocket className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white group-hover:text-green-400 transition-colors duration-300">
                {t("services.investors.title")}
              </h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                {t("services.investors.description")}
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-white/60">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  {t("services.investors.feature1")}
                </div>
                <div className="flex items-center text-sm text-white/60">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  {t("services.investors.feature2")}
                </div>
              </div>
              <Link 
                to="/financing"
                className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors duration-300 font-medium"
              >
                {t("button.seeMore")}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
            
            {/* IP Strategy Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-primary/10 border border-white/10 p-8 hover:border-blue-500/30 transition-all duration-500 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors duration-300">
                {t("services.ip.title")}
              </h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                {t("services.ip.description")}
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-white/60">
                  <CheckCircle className="h-4 w-4 text-blue-400 mr-2" />
                  {t("services.ip.feature1")}
                </div>
                <div className="flex items-center text-sm text-white/60">
                  <CheckCircle className="h-4 w-4 text-blue-400 mr-2" />
                  {t("services.ip.feature2")}
                </div>
              </div>
              <Link 
                to="/contact"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium"
              >
                {t("button.contactUs")}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
            
            {/* MVP Development Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-accent/10 border border-white/10 p-8 hover:border-purple-500/30 transition-all duration-500 hover:transform hover:scale-105 md:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white group-hover:text-purple-400 transition-colors duration-300">
                {t("services.mvp.title")}
              </h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                {t("services.mvp.description")}
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-white/60">
                  <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
                  {t("services.mvp.feature1")}
                </div>
                <div className="flex items-center text-sm text-white/60">
                  <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
                  {t("services.mvp.feature2")}
                </div>
              </div>
              <Link 
                to="/contact"
                className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-300 font-medium"
              >
                {t("button.requestQuote")}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
          
          <div className="text-center">
            <Button asChild size="lg" className="button-gradient text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <Link to="/contact" className="flex items-center">
                {t("button.getPersonalizedQuote")}
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <ErrorBoundary>
        <FeaturesSection />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <DashboardSection />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <NewsletterSection />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <InternalLinks currentPage="/" />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
    </div>
    </>
  );
}
