
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import LandingProgressCard from './LandingProgressCard';

export default function HeroSection() {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const authStatus = !!session;
      console.log('HeroSection - Auth status:', authStatus, 'Session:', session?.user?.id);
      setIsAuthenticated(authStatus);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const authStatus = !!session;
      console.log('HeroSection - Auth state changed:', event, authStatus, 'User:', session?.user?.id);
      setIsAuthenticated(authStatus);
    });

    return () => subscription.unsubscribe();
  }, []);

  console.log('HeroSection - Rendering with isAuthenticated:', isAuthenticated);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-800 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t("hero.badge")}</span>
          </div>
          
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="block text-gradient">Fund Road</span>
            <span className="block text-2xl md:text-4xl font-normal text-white/80 mt-4">
              {t("hero.title")} <span className="text-gradient">{t("hero.titleHighlight")}</span> {t("hero.titleEnd")}
            </span>
          </h1>
          
          {/* Subtitle */}
          <div className="text-xl md:text-2xl text-white/70 space-y-2 mb-12 max-w-4xl mx-auto animate-fade-in delay-200">
            <p className="leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Progress Card - always show for authenticated users */}
          {isAuthenticated && (
            <div className="max-w-md mx-auto mb-12 animate-fade-in delay-300">
              <LandingProgressCard />
            </div>
          )}
          
          {/* Key benefits - only show for non-authenticated users or below progress */}
          {!isAuthenticated && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto animate-fade-in delay-300">
              <div className="glass-card p-6">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Méthodologie éprouvée</h3>
                <p className="text-sm text-white/60">Un processus structuré basé sur les meilleures pratiques</p>
              </div>
              <div className="glass-card p-6">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Rocket className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Outils interactifs</h3>
                <p className="text-sm text-white/60">Templates et outils pour chaque étape de votre développement</p>
              </div>
              <div className="glass-card p-6">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Accompagnement</h3>
                <p className="text-sm text-white/60">Support personnalisé pour maximiser vos chances de succès</p>
              </div>
            </div>
          )}
          
          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in delay-500">
            <Button asChild size="lg" className="button-gradient text-white px-8 py-4 text-lg font-semibold shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105">
              <Link to={isAuthenticated ? "/roadmap" : "/auth"} className="flex items-center">
                {t("button.getStarted")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm">
              <Link to="/about" className="flex items-center">
                {t("button.learnMore")}
              </Link>
            </Button>
          </div>
          
          {/* Stats - only show for non-authenticated users */}
          {!isAuthenticated && (
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto animate-fade-in delay-700">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">7</div>
                <div className="text-sm text-white/60">Entrepreneurs accompagnés</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">3</div>
                <div className="text-sm text-white/60">Partenaires clés</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-white/60">Taux de satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">24/7</div>
                <div className="text-sm text-white/60">Support disponible</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
