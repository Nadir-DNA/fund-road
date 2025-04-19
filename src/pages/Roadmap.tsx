
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JourneyTimeline from "@/components/JourneyTimeline";
import JourneyProgressIndicator from "@/components/journey/JourneyProgressIndicator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { journeySteps } from "@/data/journeySteps";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { BookOpen, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { clearLastPath } from "@/utils/navigationUtils";

export default function Roadmap() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [lastVisitedStep, setLastVisitedStep] = useState<{ stepId: number, substepTitle: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const { localSteps, isLoading: stepsLoading } = useJourneyProgress(journeySteps);
  
  const targetStepId = searchParams.get('step') ? parseInt(searchParams.get('step') || '1') : null;
  const targetSubstep = searchParams.get('substep');
  
  // Check auth and get progress - improved for reliability
  useEffect(() => {
    let mounted = true;
    
    const checkAuthAndGetProgress = async () => {
      if (!mounted) return;
      setIsLoading(true);
      
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session) {
          if (!targetStepId && !targetSubstep) {
            toast({
              title: "Connexion requise",
              description: "Vous devez être connecté pour accéder à votre parcours personnalisé.",
              variant: "destructive",
              duration: 5000,
            });
            navigate("/auth");
            return;
          }
        }
        
        if (session?.session && mounted) {
          try {
            const { data: substepProgress, error: substepError } = await supabase
              .from('user_substep_progress')
              .select('step_id, substep_title, updated_at')
              .eq('user_id', session.session.user.id)
              .order('updated_at', { ascending: false })
              .limit(1);
              
            if (!substepError && substepProgress && substepProgress.length > 0 && mounted) {
              setLastVisitedStep({
                stepId: substepProgress[0].step_id,
                substepTitle: substepProgress[0].substep_title
              });
            } else {
              const { data: stepProgress, error: stepError } = await supabase
                .from('user_journey_progress')
                .select('step_id, updated_at')
                .eq('user_id', session.session.user.id)
                .order('updated_at', { ascending: false })
                .limit(1);
                
              if (!stepError && stepProgress && stepProgress.length > 0 && mounted) {
                setLastVisitedStep({
                  stepId: stepProgress[0].step_id,
                  substepTitle: null
                });
              }
            }
          } catch (error) {
            console.error("Error fetching progress data:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    checkAuthAndGetProgress();
    
    return () => {
      mounted = false;
    };
  }, [navigate, targetStepId, targetSubstep]);
  
  // Scroll to target step when parameters or loading state changes
  useEffect(() => {
    if (!stepsLoading && targetStepId && targetSubstep) {
      const timer = setTimeout(() => {
        const stepElement = document.querySelector(`[data-step-id="${targetStepId}"]`);
        if (stepElement) {
          stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          setTimeout(() => {
            (stepElement as HTMLElement).click();
          }, 500);
        }
        
        clearLastPath();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [stepsLoading, targetStepId, targetSubstep]);
  
  const findIncompleteStep = () => {
    if (lastVisitedStep) return lastVisitedStep;
    
    for (const step of localSteps) {
      if (!step.isCompleted) {
        if (step.subSteps) {
          for (const substep of step.subSteps) {
            if (!substep.isCompleted) {
              return { stepId: step.id, substepTitle: substep.title };
            }
          }
        }
        return { stepId: step.id, substepTitle: null };
      }
    }
    
    return { stepId: localSteps[0].id, substepTitle: null };
  };
  
  const handleContinueJourney = () => {
    setIsNavigating(true);
    const nextStep = findIncompleteStep();
    
    if (!nextStep) {
      setIsNavigating(false);
      return;
    }
    
    const stepElement = document.querySelector(`[data-step-id="${nextStep.stepId}"]`);
    if (stepElement) {
      stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        (stepElement as HTMLElement).click();
        setIsNavigating(false);
      }, 500);
    } else {
      setIsNavigating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-16">
        <section className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Parcours Entrepreneurial
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Suivez ces étapes pour transformer votre idée en entreprise, avec des ressources dédiées à chaque phase.
            </p>
            
            {!isLoading && lastVisitedStep ? (
              <Button 
                onClick={handleContinueJourney}
                className="mt-6 bg-gradient-to-r from-primary to-accent text-white px-8"
                disabled={stepsLoading || isNavigating}
              >
                {isNavigating ? (
                  <LoadingIndicator size="sm" className="mr-2" />
                ) : (
                  <BookOpen className="mr-2 h-4 w-4" />
                )}
                {t("roadmap.continueJourney") || "Reprendre mon parcours"}
                {!isNavigating && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            ) : isLoading ? (
              <Skeleton className="h-11 w-60 mx-auto mt-6" />
            ) : null}
          </div>
          
          <JourneyProgressIndicator />
          
          {stepsLoading ? (
            <div className="w-full flex justify-center py-12">
              <LoadingIndicator size="lg" />
            </div>
          ) : (
            <JourneyTimeline />
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
