
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, CheckCircle, Circle, ArrowRight } from 'lucide-react';
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
  
  const roadmapSteps = [
    { title: "Idéation", description: "Validez votre concept", completed: true },
    { title: "Structuration", description: "Organisez votre projet", completed: false },
    { title: "Développement", description: "Créez votre MVP", completed: false },
    { title: "Financement", description: "Levez des fonds", completed: false },
  ];
  
  const renderRoadmapButton = () => {
    if (authLoading) {
      return <Skeleton className="h-14 w-72" />;
    }
    
    return (
      <Button asChild size="lg" className="button-gradient text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group">
        <Link to={isAuthenticated ? "/roadmap" : "/auth"} className="flex items-center">
          <BookOpen className="mr-3 h-6 w-6" />
          {isAuthenticated 
            ? "Continuer mon parcours" 
            : "Commencer mon parcours"}
          <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </Button>
    );
  };
  
  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-black relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Parcours <span className="text-gradient">entrepreneurial</span> complet
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Notre roadmap interactive vous guide étape par étape, de l'idée initiale 
              jusqu'à la levée de fonds, avec des outils personnalisés à chaque phase.
            </p>
          </div>
          
          {/* Progress display for authenticated users */}
          {isAuthenticated && !progressLoading && progress.percentage > 0 && (
            <div className="mb-12 text-center">
              <div className="glass-card p-8 inline-flex items-center gap-6 mx-auto max-w-md">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gradient mb-2">{progress.percentage}%</div>
                  <div className="text-sm text-white/70">Progression</div>
                </div>
                <div className="h-12 w-px bg-white/20"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">{progress.completedSteps}/{progress.totalSteps}</div>
                  <div className="text-sm text-white/70">Étapes complétées</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Roadmap visualization */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            {roadmapSteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connection line */}
                {index < roadmapSteps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent transform translate-x-3"></div>
                )}
                
                <div className="glass-card p-6 text-center group hover:border-primary/30 transition-all duration-300">
                  <div className="flex justify-center mb-4">
                    {step.completed ? (
                      <CheckCircle className="h-12 w-12 text-primary" />
                    ) : (
                      <Circle className="h-12 w-12 text-white/40 group-hover:text-primary/60 transition-colors duration-300" />
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA */}
          <div className="text-center">
            {renderRoadmapButton()}
          </div>
        </div>
      </div>
    </section>
  );
}
