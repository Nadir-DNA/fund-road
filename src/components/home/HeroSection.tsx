import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Rocket, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import LandingProgressCard from './LandingProgressCard';

export default function HeroSection() {
  const { t } = useLanguage();
  const { user, isAuthChecked } = useAuth();
  const isAuthenticated = !!user;

  return (
    <section className="relative min-h-[92dvh] flex items-center justify-center overflow-hidden pt-[68px]">
      {/* Background — blobs subtils */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/[0.07] rounded-full filter blur-[100px] animate-pulse-subtle" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/[0.05] rounded-full filter blur-[120px] animate-pulse-subtle [animation-delay:1s]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-medium text-primary">{t("hero.badge")}</span>
          </div>
          
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 tracking-tight animate-fade-in">
            <span className="block text-gradient">Fund Road</span>
            <span className="block text-xl sm:text-2xl md:text-4xl font-normal text-foreground/70 mt-4 leading-snug">
              {t("hero.title")} <span className="text-gradient">{t("hero.titleHighlight")}</span> {t("hero.titleEnd")}
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-foreground/60 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in [animation-delay:100ms]">
            {t("hero.subtitle")}
          </p>

          {/* Progress Card pour utilisateurs connectés */}
          {isAuthenticated && (
            <div className="max-w-md mx-auto mb-10 animate-scale-in">
              <LandingProgressCard />
            </div>
          )}
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 animate-fade-in [animation-delay:200ms]">
            <Button 
              asChild 
              size="lg" 
              className="button-gradient text-primary-foreground px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              <Link to={isAuthenticated ? "/roadmap" : "/auth"} className="flex items-center">
                {isAuthenticated ? "Continuer mon parcours" : t("button.getStarted")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-white/10 text-foreground hover:bg-white/5 px-8 h-12 text-base backdrop-blur-sm"
            >
              <Link to="/roadmap-startup" className="flex items-center">
                Voir la roadmap
              </Link>
            </Button>
          </div>
          
          {/* Social proof — toujours visible */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto animate-fade-in [animation-delay:300ms]">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">300+</div>
              <div className="text-xs md:text-sm text-foreground/50 mt-1">Startups accompagnées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent">15M€+</div>
              <div className="text-xs md:text-sm text-foreground/50 mt-1">Levés via la plateforme</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">92%</div>
              <div className="text-xs md:text-sm text-foreground/50 mt-1">Taux de complétion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent">48h</div>
              <div className="text-xs md:text-sm text-foreground/50 mt-1">Data room prête</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
