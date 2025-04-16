
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from "@/integrations/supabase/client";
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import { journeySteps } from '@/data/journeySteps';

export default function RoadmapSection() {
  const { progress, isLoading: progressLoading } = useJourneyProgress(journeySteps);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const renderRoadmapButton = () => {
    if (authLoading) {
      return <Skeleton className="h-14 w-72" />;
    }
    
    return (
      <Button asChild className="bg-gradient-to-r from-primary to-accent text-white px-8 py-6 text-lg">
        <Link to={isAuthenticated ? "/roadmap" : "/auth"} className="flex items-center">
          <BookOpen className="mr-2 h-5 w-5" />
          {isAuthenticated 
            ? "Accéder au parcours entrepreneurial" 
            : "Commencer mon parcours entrepreneurial"}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    );
  };
  
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Parcours entrepreneurial complet
        </h2>
        <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10">
          Accédez à notre roadmap interactive pour structurer votre projet étape par étape, 
          avec des outils et ressources pour chaque phase de développement.
        </p>
        
        {isAuthenticated && !progressLoading && progress.percentage > 0 ? (
          <div className="mb-8">
            <div className="glass-card py-4 px-8 inline-flex items-center gap-4 mx-auto">
              <div className="text-2xl font-bold text-primary">{progress.percentage}%</div>
              <div className="text-left">
                <div className="text-sm text-white/70">Parcours complété</div>
                <div className="text-xs text-white/50">{progress.completedSteps}/{progress.totalSteps} étapes</div>
              </div>
            </div>
          </div>
        ) : isAuthenticated && progressLoading ? (
          <div className="mb-8">
            <Skeleton className="h-16 w-48 mx-auto" />
          </div>
        ) : null}
        
        <div className="flex justify-center">
          {renderRoadmapButton()}
        </div>
      </div>
    </section>
  );
}
